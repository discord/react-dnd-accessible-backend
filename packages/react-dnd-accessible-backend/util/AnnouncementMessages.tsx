type ItemMessageGetter = (itemId: string, node: HTMLElement | null) => string;

export interface AnnouncementMessages {
  pickedUpItem: ItemMessageGetter;
  droppedItem: ItemMessageGetter;
  hoveredTarget: ItemMessageGetter;
  canceledDrag: ItemMessageGetter;
}

export function getNodeDescription(node: HTMLElement | null): string | undefined {
  if (node == null) return undefined;

  return node.getAttribute("data-dnd-name") ?? node.getAttribute("aria-label") ?? node.innerText;
}

export const DEFAULT_ANNOUNCEMENT_MESSAGES: AnnouncementMessages = {
  pickedUpItem: (itemId: string, node: HTMLElement | null) => {
    const label = getNodeDescription(node) ?? itemId;

    return `Picked up ${label}`;
  },
  droppedItem: (itemId: string, node: HTMLElement | null) => {
    const label = getNodeDescription(node) ?? itemId;

    return `Dropped ${label}`;
  },
  hoveredTarget: (targetId: string, node: HTMLElement | null) => {
    const label = getNodeDescription(node) ?? targetId;

    return `Over ${label}`;
  },
  canceledDrag: (itemId: string, node: HTMLElement | null) => {
    const label = getNodeDescription(node) ?? itemId;

    return `Stopped dragging ${label}`;
  },
};

export function getDefaultAnnouncementMessages() {
  return DEFAULT_ANNOUNCEMENT_MESSAGES;
}
