import { AnnouncementMessages, getDefaultAnnouncementMessages } from "./util/AnnouncementMessages";
// It's a little annoying to have to statically require this. We _could_ make
// it fully external and require consumers to provide it always, but ensuring
// that an announcer exists implicitly feels more appropriate. Most consumers
// likely won't override this, or will be overriding with the same library
// anyway.
import * as LiveAnnouncer from "@react-aria/live-announcer";

type Assertiveness = "assertive" | "polite";
export interface Announcer {
  announce(message: string, assertiveness?: Assertiveness, timeout?: number): void;
  clearAnnouncements(assertiveness?: Assertiveness): void;
  destroy?(): void;
}
interface AnnouncerOptions {
  getAnnouncementMessages?: () => AnnouncementMessages;
  announcer?: Announcer;
}

export default class DragAnnouncer {
  private announcer: Announcer;
  private externalAnnouncer: boolean;
  private getMessages: () => AnnouncementMessages;

  public constructor({ getAnnouncementMessages, announcer }: AnnouncerOptions = {}) {
    this.getMessages = getAnnouncementMessages ?? getDefaultAnnouncementMessages;
    this.externalAnnouncer = false;

    if (announcer != null) {
      this.announcer = announcer;
      this.externalAnnouncer = true;
    } else {
      this.announcer = {
        announce: LiveAnnouncer.announce,
        clearAnnouncements: LiveAnnouncer.clearAnnouncer,
        destroy: LiveAnnouncer.destroyAnnouncer,
      };
    }
  }

  announce(message: string, assertiveness?: Assertiveness, timeout?: number) {
    this.announcer.announce(message, assertiveness, timeout);
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
    this.announcer.clearAnnouncements();
  }

  destroy() {
    // don't destroy an external announcer, since it is likely used outside of drag-and-drop
    if (!this.externalAnnouncer) {
      this.announcer.destroy?.();
    }
  }
}
