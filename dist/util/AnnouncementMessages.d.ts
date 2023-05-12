declare type ItemMessageGetter = (itemId: string, node: HTMLElement | null) => string;
export interface AnnouncementMessages {
    pickedUpItem: ItemMessageGetter;
    droppedItem: ItemMessageGetter;
    hoveredTarget: ItemMessageGetter;
    canceledDrag: ItemMessageGetter;
}
export declare const DEFAULT_ANNOUNCEMENT_MESSAGES: AnnouncementMessages;
export declare function getDefaultAnnouncementMessages(): AnnouncementMessages;
export {};
