import DragAnnouncer from "./DragAnnouncer";
import DragPreviewer from "./DragPreviewer";
import { DropTargetNavigator } from "./DropTargetNavigator";
import getNodeClientOffset from "./util/getNodeClientOffset";
import isKeyboardDragTrigger from "./util/isKeyboardDragTrigger";
import stopEvent from "./util/stopEvent";

import type { Announcer } from "./DragAnnouncer";
import type {
  Backend,
  BackendFactory,
  DragDropActions,
  DragDropMonitor,
  Identifier,
  DragDropManager,
  Unsubscribe,
} from "dnd-core";
import type { AnnouncementMessages } from "./util/AnnouncementMessages";

const Trigger = {
  DROP: [" ", "Enter"],
  CANCEL_DRAG: ["Escape"],
  TAB: ["Tab"],
};

function isTrigger(event: KeyboardEvent, trigger: typeof Trigger[keyof typeof Trigger]) {
  return trigger.includes(event.key);
}

interface KeyboardBackendContext {
  window?: Window;
  document?: Document;
}

interface KeyboardBackendOptions {
  onDndModeChanged?: (enabled: boolean) => unknown;
  isDragTrigger?: (event: KeyboardEvent, isFirstEvent: boolean) => boolean;
  getAnnouncementMessages?: () => AnnouncementMessages;
  announcer?: Announcer;
  previewerClassName?: string;
  preview?: boolean;
}

export class KeyboardBackend implements Backend {
  private static isSetUp: boolean;
  // React-DnD Dependencies
  private manager: DragDropManager;
  private actions: DragDropActions;
  private monitor: DragDropMonitor;
  private context: KeyboardBackendContext;
  private options?: KeyboardBackendOptions;
  // Internal State
  private sourceNodes: Map<Identifier, HTMLElement>;
  private sourcePreviewNodes: Map<string, HTMLElement>;
  private sourcePreviewNodeOptions: Map<string, any>;
  private targetNodes: Map<string, HTMLElement>;
  private _navigator: DropTargetNavigator | undefined;
  public _previewer: DragPreviewer;
  private _announcer: DragAnnouncer;
  private _previewEnabled: boolean;
  private _isDragTrigger: (event: KeyboardEvent, isFirstEvent: boolean) => boolean;
  private _handlingFirstEvent: boolean = false;

  public constructor(
    manager: DragDropManager,
    context: KeyboardBackendContext,
    options?: KeyboardBackendOptions,
  ) {
    this.manager = manager;
    this.actions = manager.getActions();
    this.monitor = manager.getMonitor();
    this.context = context;
    this.options = options;
    this._isDragTrigger = options?.isDragTrigger ?? isKeyboardDragTrigger;
    this._previewEnabled = options?.preview ?? true;

    this.sourceNodes = new Map();
    this.sourcePreviewNodes = new Map();
    this.sourcePreviewNodeOptions = new Map();
    this.targetNodes = new Map();

    this._previewer = new DragPreviewer(context.document, options);
    this._announcer = new DragAnnouncer(options);
  }

  public setup() {
    if (KeyboardBackend.isSetUp) {
      throw new Error("Cannot have two Keyboard backends at the same time.");
    }
    KeyboardBackend.isSetUp = true;

    this._handlingFirstEvent = true;
    this.context.window?.addEventListener("keydown", this.handleGlobalKeyDown, { capture: true });

    this._previewer.attach();
  }

  public teardown() {
    KeyboardBackend.isSetUp = false;
    this.context.window?.removeEventListener("keydown", this.handleGlobalKeyDown, {
      capture: true,
    });
    this.endDrag();

    this._previewer.detach();
    this._announcer.destroy();
  }

  private handleGlobalKeyDown = (event: KeyboardEvent) => {
    if (this.monitor.isDragging() && isTrigger(event, Trigger.CANCEL_DRAG)) {
      this.endDrag(event);
      const sourceId = String(this.monitor.getSourceId());
      const sourceNode = this.sourceNodes.get(sourceId);
      this._announcer.announceCancel(sourceNode ?? null, sourceId);
    }
    // Prevent tabbing to other elements when dragging locking the focus on drag source
    if (this.monitor.isDragging() && isTrigger(event, Trigger.TAB)) event.preventDefault();
  };

  private setDndMode(enabled: boolean) {
    this.options?.onDndModeChanged?.(enabled);
  }

  public profile(): Record<string, number> {
    return {
      sourcePreviewNodes: this.sourcePreviewNodes.size,
      sourcePreviewNodeOptions: this.sourcePreviewNodeOptions.size,
      sourceNodes: this.sourceNodes.size,
    };
  }

  public connectDragSource(sourceId: string, node: HTMLElement): Unsubscribe {
    const handleDragStart = this.handleDragStart.bind(this, sourceId);

    this.sourceNodes.set(sourceId, node);
    node.addEventListener("keydown", handleDragStart);
    return () => {
      this.sourceNodes.delete(sourceId);
      node.removeEventListener("keydown", handleDragStart);
    };
  }

  public connectDragPreview(sourceId: string, node: HTMLElement, options: any): Unsubscribe {
    this.sourcePreviewNodeOptions.set(sourceId, options);
    this.sourcePreviewNodes.set(sourceId, node);
    return () => {
      this.sourcePreviewNodes.delete(sourceId);
      this.sourcePreviewNodeOptions.delete(sourceId);
    };
  }

  public connectDropTarget(targetId: string, node: HTMLElement): Unsubscribe {
    this.targetNodes.set(targetId, node);
    node.addEventListener("keydown", this.handleDrop);
    // Ensure that the target will be focusable by the navigator
    node.tabIndex = Math.max(-1, node.tabIndex);

    return () => {
      this.targetNodes.delete(targetId);
      node.removeEventListener("keydown", this.handleDrop);
    };
  }

  private getSourceClientOffset = (sourceId: string) => {
    return getNodeClientOffset(this.sourceNodes.get(sourceId));
  };

  private handleDragStart = (sourceId: string, event: KeyboardEvent) => {
    if (!this._isDragTrigger(event, this._handlingFirstEvent)) return;
    this._handlingFirstEvent = false;

    if (!this.monitor.canDragSource(sourceId)) return;

    if (this.monitor.isDragging()) {
      this.actions.publishDragSource();
      return;
    }

    stopEvent(event);

    const sourceNode = this.sourceNodes.get(sourceId);
    if (sourceNode == null) return;

    this._navigator = new DropTargetNavigator(
      sourceNode,
      this.targetNodes,
      this.manager,
      this._previewer,
      this._announcer,
    );
    this._previewer.createDragPreview(this.sourcePreviewNodes.get(sourceId) ?? sourceNode);

    this.actions.beginDrag([sourceId], {
      clientOffset: this.getSourceClientOffset(sourceId),
      getSourceClientOffset: this.getSourceClientOffset,
      publishSource: false,
      item: this.monitor.getItem(),
      itemType: this.monitor.getItemType(),
    });
    this.actions.publishDragSource();
    this._previewer.render(this.monitor);
    this.setDndMode(true);
    this._announcer.announceDrag(sourceNode, sourceId);
  };

  private handleDrop = (event: KeyboardEvent) => {
    if (!isTrigger(event, Trigger.DROP)) return;

    const sourceId = String(this.monitor.getSourceId());
    const sourceNode = this.sourceNodes.get(sourceId);
    this._announcer.announceDrop(sourceNode ?? null, sourceId);

    this.actions.drop();
    this.endDrag(event);
  };

  private endDrag(event?: KeyboardEvent) {
    event != null && stopEvent(event);
    this._navigator?.disconnect();
    this._previewer.clear();
    if (this.monitor.isDragging()) this.actions.endDrag();
    this.setDndMode(false);
  }
}

const createKeyboardBackendFactory: BackendFactory = (
  manager: DragDropManager,
  context: KeyboardBackendContext,
  options?: KeyboardBackendOptions,
) => new KeyboardBackend(manager, context, options);

export default createKeyboardBackendFactory;
