export default function stopEvent(event: KeyboardEvent) {
  event.preventDefault();
  event.stopImmediatePropagation();
}
