import DragPreviewer from "./DragPreviewer";
import type { Announcer } from "./DragAnnouncer";
import type { Backend, BackendFactory, DragDropManager, Unsubscribe } from "dnd-core";
import type { AnnouncementMessages } from "./util/AnnouncementMessages";
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
}
export declare class KeyboardBackend implements Backend {
    private static isSetUp;
    private manager;
    private actions;
    private monitor;
    private context;
    private options?;
    private sourceNodes;
    private sourcePreviewNodes;
    private sourcePreviewNodeOptions;
    private targetNodes;
    private _navigator;
    _previewer: DragPreviewer;
    private _announcer;
    private _isDragTrigger;
    private _handlingFirstEvent;
    constructor(manager: DragDropManager, context: KeyboardBackendContext, options?: KeyboardBackendOptions);
    setup(): void;
    teardown(): void;
    private handleGlobalKeyDown;
    private setDndMode;
    profile(): Record<string, number>;
    connectDragSource(sourceId: string, node: HTMLElement): Unsubscribe;
    connectDragPreview(sourceId: string, node: HTMLElement, options: any): Unsubscribe;
    connectDropTarget(targetId: string, node: HTMLElement): Unsubscribe;
    private getSourceClientOffset;
    private handleDragStart;
    private handleDrop;
    private endDrag;
}
declare const createKeyboardBackendFactory: BackendFactory;
export default createKeyboardBackendFactory;
