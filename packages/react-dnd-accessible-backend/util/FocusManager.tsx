export interface FocusManagerOptions {
  getFocusableElements(): HTMLElement[];
  getActiveElement(): Element | null | undefined;
  scrollToStart?: () => Promise<unknown>;
  scrollToEnd?: () => Promise<unknown>;
}

export interface FocusOptions {
  wrap?: boolean;
  from?: HTMLElement;
}

export interface FocusManager {
  getNextFocusableElement(options?: FocusOptions): Promise<HTMLElement | null>;
  getPreviousFocusableElement(options?: FocusOptions): Promise<HTMLElement | null>;
  getFirstFocusableElement(): HTMLElement | null;
  getLastFocusableElement(): HTMLElement | null;
}

export function createFocusManager({
  getFocusableElements,
  getActiveElement,
  scrollToStart,
  scrollToEnd,
}: FocusManagerOptions): FocusManager {
  function findNextFocusableElement(currentTarget: Element): HTMLElement | null {
    const elements = getFocusableElements();
    return (
      elements.find((element) => {
        return !!(
          currentTarget.compareDocumentPosition(element) &
          (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY)
        );
      }) ?? null
    );
  }


  async function getNextFocusableElement(options?: FocusOptions): Promise<HTMLElement | null> {
    const currentTarget = options?.from || getActiveElement();
    if (currentTarget == null) {
      return null;
    }
    const next = findNextFocusableElement(currentTarget);
    if (next == null && options?.wrap) {
      await scrollToStart?.();
      return getFirstFocusableElement();
    }
    return next;
  }

  function findPreviousFocusableElement(currentTarget: Element): HTMLElement | null {
    const elements = getFocusableElements();
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (
        currentTarget.compareDocumentPosition(element) &
        (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINED_BY)
      ) {
        return element;
      }
    }
    return null;
  }

  async function getPreviousFocusableElement(options?: FocusOptions): Promise<HTMLElement | null> {
    const currentTarget = options?.from || getActiveElement();
    if (currentTarget == null) {
      return null;
    }
    const previous = findPreviousFocusableElement(currentTarget);
    if (previous == null && options?.wrap) {
      await scrollToEnd?.();
      return getLastFocusableElement();
    }
    return previous;
  }

  function getFirstFocusableElement(): HTMLElement | null {
    const elements = getFocusableElements();
    return elements[0] ?? null;
  }

  function getLastFocusableElement(): HTMLElement | null {
    const elements = getFocusableElements();
    return elements[elements.length - 1] ?? null;
  }

  return {
    getNextFocusableElement,
    getPreviousFocusableElement,
    getFirstFocusableElement,
    getLastFocusableElement,
  };
}
