import type DragAnnouncer from "./DragAnnouncer";
import type DragPreviewer from "./DragPreviewer";
import type { DragDropManager } from "dnd-core";
export declare class DropTargetNavigator {
    private targetNodes;
    private manager;
    private previewer;
    private announcer;
    private currentHoveredNode;
    private focusManager;
    private actions;
    private monitor;
    constructor(sourceNode: HTMLElement, targetNodes: Map<string, HTMLElement>, manager: DragDropManager, previewer: DragPreviewer, announcer: DragAnnouncer);
    disconnect(): void;
    handleDraggedElementKeyDown: (event: KeyboardEvent) => void;
    hoverNode(node: HTMLElement | null): void;
    getNextDropTarget(): HTMLElement | null;
    getPreviousDropTarget(): HTMLElement | null;
    getViableTargets(nodes: Map<string, HTMLElement>): HTMLElement[];
    getAllowedTargets(nodes: Map<string, HTMLElement>): HTMLElement[];
}
