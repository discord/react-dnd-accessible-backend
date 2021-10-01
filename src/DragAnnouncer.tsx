import { AnnouncementMessages, getDefaultAnnouncementMessages } from "./util/AnnouncementMessages";

interface AnnouncerOptions {
  getAnnouncementMessages?: () => AnnouncementMessages;
  announcerClassName?: string;
}

export default class DragAnnouncer {
  private target: HTMLElement | undefined;
  private getMessages: () => AnnouncementMessages;

  public constructor(
    private document: Document | undefined,
    { getAnnouncementMessages, announcerClassName }: AnnouncerOptions = {},
  ) {
    this.getMessages = getAnnouncementMessages ?? getDefaultAnnouncementMessages;
    this.target = this.document?.createElement("span");
    if (this.target != null) {
      this.target.setAttribute("aria-live", "assertive");
      this.target.setAttribute("aria-atomic", "true");

      if (announcerClassName) {
        this.target.className = announcerClassName;
      } else {
        this.target.className = "drag-announcer";
        this.target.style.cssText =
          "position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); border: 0;";
      }
    }
  }

  attach() {
    if (this.target == null) return;
    this.document?.body.appendChild(this.target);
  }

  detach() {
    const body = this.document?.body;
    if (this.target == null || body == null) return;
    if (body.contains(this.target)) {
      body.removeChild(this.target);
    }
  }

  announce(message: string) {
    if (this.target == null) return;
    this.target.innerText = message;
  }

  announceDrag(node: HTMLElement | null, id: string) {
    if (node == null) return;
    this.announce(this.getMessages().pickedUpItem(id, node));
  }

  announceHover(node: HTMLElement | null, id: string) {
    if (node == null) return;

    this.announce(this.getMessages().hoveredTarget(id, node));
  }

  announceDrop(node: HTMLElement | null, id: string) {
    this.announce(this.getMessages().droppedItem(id, node));
  }

  announceCancel(node: HTMLElement | null, id: string) {
    this.announce(this.getMessages().canceledDrag(id, node));
  }

  clear() {
    this.announce("");
  }
}
