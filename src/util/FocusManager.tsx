export interface FocusManagerOptions {
  getFocusableElements(): HTMLElement[];
}

export interface FocusOptions {
  wrap?: boolean;
  from?: HTMLElement;
}

export interface FocusManager {
  getNextFocusableElement(options?: FocusOptions): HTMLElement | null;
  getPreviousFocusableElement(options?: FocusOptions): HTMLElement | null;
  getFirstFocusableElement(): HTMLElement | null;
  getLastFocusableElement(): HTMLElement | null;
}

export function createFocusManager({ getFocusableElements }: FocusManagerOptions): FocusManager {
  function getNextFocusableElement(options?: FocusOptions): HTMLElement | null {
    const currentTarget = options?.from || document.activeElement;
    if (currentTarget == null) {
      return null;
    }
    const elements = getFocusableElements();
    const nextNode = elements.find((element) => {
      return !!(
        currentTarget.compareDocumentPosition(element) &
        (Node.DOCUMENT_POSITION_FOLLOWING | Node.DOCUMENT_POSITION_CONTAINED_BY)
      );
    });
    if (nextNode == null && options?.wrap) {
      return elements[0] ?? null;
    }
    return nextNode as HTMLElement;
  }

  function getPreviousFocusableElement(options?: FocusOptions): HTMLElement | null {
    const currentTarget = options?.from || document.activeElement;
    if (currentTarget == null) {
      return null;
    }
    const elements = getFocusableElements();
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (
        currentTarget.compareDocumentPosition(element) &
        (Node.DOCUMENT_POSITION_PRECEDING | Node.DOCUMENT_POSITION_CONTAINED_BY)
      ) {
        return element as HTMLElement;
      }
    }
    if (options?.wrap) {
      return elements[elements.length - 1] ?? null;
    }
    return null;
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
