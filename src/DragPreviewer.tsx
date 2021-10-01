import type { DragDropMonitor } from "dnd-core";

interface PreviewerOptions {
  previewerClassName?: string;
}

export default class DragPreview {
  private container: HTMLElement | undefined;
  private svg: HTMLElement | undefined;
  private foreignObject: HTMLElement | undefined;

  public constructor(
    private document: Document | undefined,
    { previewerClassName }: PreviewerOptions = {},
  ) {
    this.container = this.document?.createElement("div");
    this.svg = this.document?.createElement("svg");
    this.foreignObject = this.document?.createElement("foreignObject");

    if (this.container != null && this.svg != null && this.foreignObject != null) {
      if (previewerClassName) {
        this.container.className = previewerClassName;
      } else {
        this.container.className = "drag-previewer";
        this.container.style.cssText = "z-index: 1000;";
      }

      this.svg.appendChild(this.foreignObject);
      this.container.appendChild(this.svg);
    }
  }

  attach() {
    if (this.container == null) return;
    this.document?.body.appendChild(this.container);
  }

  detach() {
    const body = this.document?.body;
    if (this.container == null || body == null) return;
    if (body.contains(this.container)) {
      body.removeChild(this.container);
    }
  }

  createDragPreview(sourceNode: HTMLElement) {
    if (this.container == null || this.svg == null || this.foreignObject == null) return;

    const { width, height } = sourceNode.getBoundingClientRect();

    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    this.svg.setAttribute("width", `${width}`);
    this.svg.setAttribute("height", `${height}`);
    this.foreignObject.setAttribute("x", "0");
    this.foreignObject.setAttribute("y", "0");
    this.foreignObject.setAttribute("width", `${width}`);
    this.foreignObject.setAttribute("height", `${height}`);

    const sourceClone = sourceNode.cloneNode(true);

    this.foreignObject.appendChild(sourceClone);
  }

  render(monitor: DragDropMonitor) {
    const container = this.container;
    if (container == null) return;

    const offset = monitor.getSourceClientOffset();
    if (offset == null) return;
    if (!monitor.isDragging()) return;

    container.style.position = "fixed";
    container.style.left = `${offset.x + 30}px`;
    container.style.top = `${offset.y + 15}px`;
  }

  clear() {
    if (this.foreignObject == null) return;
    this.foreignObject.innerHTML = "";
  }
}
