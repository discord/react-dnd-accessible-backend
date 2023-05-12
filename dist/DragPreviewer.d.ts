import type { DragDropMonitor } from "dnd-core";
interface PreviewerOptions {
    previewerClassName?: string;
}
export default class DragPreview {
    private document;
    private container;
    private svg;
    private foreignObject;
    constructor(document: Document | undefined, { previewerClassName }?: PreviewerOptions);
    attach(): void;
    detach(): void;
    createDragPreview(sourceNode: HTMLElement): void;
    render(monitor: DragDropMonitor): void;
    clear(): void;
}
export {};
