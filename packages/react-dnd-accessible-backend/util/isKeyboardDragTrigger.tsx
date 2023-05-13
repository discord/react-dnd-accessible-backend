export default function isKeyboardDragTrigger(
  event: KeyboardEvent,
  withUntrusted: boolean = false,
) {
  // VERY HACK(faulty): react-dnd-multi-backend fires a "cloned event" after
  // transitioning backends. But, that event is only a base Event, not a specialized
  // KeyboardEvent or MouseEvent, so it doesn't have any of the `.key`, `.metaKey`,
  // etc. properties on it. Because of that, knowing that this is a trigger can
  // only be done by looking at the `isTrusted` property, which is false for
  // custom-constructed events. Eventually, rdmb should fire an appropriate event instead.
  if (withUntrusted && event.isTrusted === false) return true;
  return event.key?.toLowerCase() === "d" && (event.metaKey || event.ctrlKey) && !event.altKey;
}
