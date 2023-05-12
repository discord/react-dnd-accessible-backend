import { AnnouncementMessages } from "./util/AnnouncementMessages";
declare type Assertiveness = 'assertive' | 'polite';
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
    private announcer;
    private externalAnnouncer;
    private getMessages;
    constructor({ getAnnouncementMessages, announcer }?: AnnouncerOptions);
    announce(message: string, assertiveness?: Assertiveness, timeout?: number): void;
    announceDrag(node: HTMLElement | null, id: string): void;
    announceHover(node: HTMLElement | null, id: string): void;
    announceDrop(node: HTMLElement | null, id: string): void;
    announceCancel(node: HTMLElement | null, id: string): void;
    clear(): void;
    destroy(): void;
}
export {};
