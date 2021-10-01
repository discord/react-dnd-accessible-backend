import type DragAnnouncer from "./DragAnnouncer";
import type DragPreviewer from "./DragPreviewer";
import { createFocusManager, FocusManager } from "./util/FocusManager";
import getNodeClientOffset from "./util/getNodeClientOffset";
import stopEvent from "./util/stopEvent";

import type { DragDropActions, DragDropManager, DragDropMonitor } from "dnd-core";

enum NavigationKeys {
  UP = "ArrowUp",
  DOWN = "ArrowDown",
  DROP = "Shift",
  CANCEL = "Escape",
}

export class DropTargetNavigator {
  private currentHoveredNode: HTMLElement | null;
  private focusManager: FocusManager;
  private actions: DragDropActions;
  private monitor: DragDropMonitor;

  constructor(
    sourceNode: HTMLElement,
    private targetNodes: Map<string, HTMLElement>,
    private manager: DragDropManager,
    private previewer: DragPreviewer,
    private announcer: DragAnnouncer,
  ) {
    this.currentHoveredNode = sourceNode;
    this.focusManager = createFocusManager({
      getFocusableElements: () => this.getViableTargets(targetNodes),
    });
    this.actions = manager.getActions();
    this.monitor = manager.getMonitor();

    window.addEventListener("keydown", this.handleDraggedElementKeyDown, { capture: true });
  }

  disconnect() {
    window.removeEventListener("keydown", this.handleDraggedElementKeyDown, { capture: true });
  }

  handleDraggedElementKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case NavigationKeys.UP:
        stopEvent(event);
        this.hoverNode(this.getPreviousDropTarget());
        return;

      case NavigationKeys.DOWN:
        stopEvent(event);
        this.hoverNode(this.getNextDropTarget());
        return;
    }
  };

  hoverNode(node: HTMLElement | null) {
    const targetId = Array.from(this.targetNodes.entries()).find(
      ([_key, value]) => node === value,
    )?.[0];
    if (targetId == null) return;

    this.actions.hover([targetId], { clientOffset: getNodeClientOffset(node) });
    this.currentHoveredNode = node;
    this.previewer.render(this.monitor);
    this.announcer.announceHover(node, targetId);
    node?.focus();
  }

  getNextDropTarget() {
    return this.focusManager.getNextFocusableElement({
      wrap: false,
      from: this.currentHoveredNode ?? undefined,
    });
  }

  getPreviousDropTarget() {
    return this.focusManager.getPreviousFocusableElement({
      wrap: false,
      from: this.currentHoveredNode ?? undefined,
    });
  }

  getViableTargets(nodes: Map<string, HTMLElement>) {
    const allowedTargets = this.getAllowedTargets(nodes);

    return allowedTargets.sort((a, b) => {
      if (a === b) return 0;

      const position = a.compareDocumentPosition(b);
      if (
        position &
        (Node.DOCUMENT_POSITION_FOLLOWING | (position & Node.DOCUMENT_POSITION_CONTAINED_BY))
      )
        return -1;
      else if (
        position &
        (Node.DOCUMENT_POSITION_PRECEDING | (position & Node.DOCUMENT_POSITION_CONTAINS))
      )
        return 1;
      else return 0;
    });
  }

  getAllowedTargets(nodes: Map<string, HTMLElement>) {
    const sourceType = this.monitor.getItemType();
    if (sourceType == null) return Array.from(nodes.values());

    return Array.from(nodes).reduce((acc, [id, node]) => {
      if (this.manager.getMonitor().canDropOnTarget(id)) acc.push(node);
      return acc;
    }, [] as HTMLElement[]);
  }
}
