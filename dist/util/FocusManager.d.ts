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
export declare function createFocusManager({ getFocusableElements }: FocusManagerOptions): FocusManager;
