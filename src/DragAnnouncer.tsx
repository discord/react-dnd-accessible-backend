import { AnnouncementMessages, getDefaultAnnouncementMessages } from "./util/AnnouncementMessages";

type Assertiveness = 'assertive' | 'polite';
export interface Announcer {
  announce(message: string, assertiveness?: Assertiveness, timeout?: number): void;
  clearAnnouncements(assertiveness?: Assertiveness): void;
  destroy(): void;
}
interface AnnouncerOptions {
  getAnnouncementMessages?: () => AnnouncementMessages;
  announcer?: Announcer;
}

export default class DragAnnouncer {
  private announcer: Announcer;
  private getMessages: () => AnnouncementMessages;

  public constructor({getAnnouncementMessages, announcer}: AnnouncerOptions = {}) {
    this.getMessages = getAnnouncementMessages ?? getDefaultAnnouncementMessages;

    if (announcer != null) {
      this.announcer = announcer;
    } else {
      const LiveAnnouncer = require('@react-aria/live-announcer');
      this.announcer = {
        announce: LiveAnnouncer.announce,
        clearAnnouncements: LiveAnnouncer.clearAnnouncer,
        destroy: LiveAnnouncer.destroyAnnouncer,
      };
    }
  }

  announceDrag(node: HTMLElement | null, id: string) {
    if (node == null) return;
    this.announcer.announce(this.getMessages().pickedUpItem(id, node));
  }

  announceHover(node: HTMLElement | null, id: string) {
    if (node == null) return;
    this.announcer.announce(this.getMessages().hoveredTarget(id, node));
  }

  announceDrop(node: HTMLElement | null, id: string) {
    this.announcer.announce(this.getMessages().droppedItem(id, node));
  }

  announceCancel(node: HTMLElement | null, id: string) {
    this.announcer.announce(this.getMessages().canceledDrag(id, node));
  }

  clear() {
    this.announcer.clearAnnouncements();
  }

  destroy() {
    this.announcer.destroy?.();
  }
}
