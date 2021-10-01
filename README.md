# react-dnd-accessible-backend

An add-on backend for `react-dnd` that provides support for keyboards and screenreaders by default.
Keep writing the same drag and drop code while enabling more users to interact with your app.

## Installation

This package is available on npm as `react-dnd-accessible-backend`.

```shell
npm install react-dnd-accessible-backend
```

## Basic Usage

`react-dnd-accessible-backend` is not a _replacement_ backend for `react-dnd`, but rather an
_additional_ one. This means you will most likely need to compose backends together to get all of
the functionality you would like (mouse dragging, keyboards, pointer dragging on mobile, etc).

One of the easiest ways to do this is with [`react-dnd-multi-backend`](https://www.npmjs.com/package/react-dnd-multi-backend)
and it's Transition system. Using that library, just add another backend entry and create a Transition for the keyboard trigger, like so:

```typescript
import KeyboardBackend, {isKeyboardDragTrigger} from 'react-dnd-accessible-backend';
import {HTML5Backend} from 'react-dnd-html5-backend';
import {DndProvider, createTransition} from 'react-dnd-multi-backend';

const KeyboardTransition = createTransition('keydown', (event) => {
  if (!isKeyboardDragTrigger(event as KeyboardEvent)) return false;
  event.preventDefault();
  return true;
});

const DND_OPTIONS = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'keyboard',
      backend: KeyboardBackend,
      context: {window, document},
      preview: true,
      transition: KeyboardTransition,
    },
  ],
};

function App() {
  return <DndProvider options={DND_OPTIONS}>...</DndProvider>;
}
```

That's all it takes to get started! There are a few [considerations](#considerations) you'll want to keep in mind to ensure a really good experience for your users, but everything else should be automatic.

## Options

`react-dnd-accessible-backend` provides a few options for customizing styles and behavior for use in your app. If you're using `react-dnd-multi-backend`, these can get passed in as an `options` field on the backend configuration object, or otherwise as the third argment when calling the backend directly as a factory function (like `KeyboardBackend(manager, context, options)`.

These options are:

### `getAnnouncementMessages?: () => AnnouncementMessages`

This function is called any time a drag and drop action is performed by the keyboard backend and is useful for providing translations or more descriptive messages for screenreader users as they interact with draggable items.

If this option is not provided, a [default set of messages in English](https://github.com/discord/react-dnd-accessible-backend/blob/main/src/util/AnnouncementMessages.tsx#L16-L37) will be used. Providing a separate function requires that you specify a replacement for _all_ messages that can be announced. These (currently) are `pickedUpItem`, `droppedItem`, `hoveredTarget` and `canceledDrag`.

Each message getter is defined as a function that takes in an `itemId` and the HTML `node` that is relevant to the operation.

```typescript
// A very naive example of how to provide custom announcement messages.
function getCustomAnnouncementMessages() {
  return {
    pickedUpItem: (itemId: string, node: HTMLElement | null) => `Picked up ${itemId}`,
    droppedItem: (itemId: string, node: HTMLElement | null) => `Dropped ${itemId}`,
    hoveredTarget: (itemId: string, node: HTMLElement | null) => `Hoevered over ${itemId}`,
    canceledDrag: (itemId: string, node: HTMLElement | null) => "Drag cancelled"
  };
}

{
  id: 'keyboard',
  backend: KeyboardBackend,
  context: {window, document},
  options: {
    getAnnouncementMessages: getCustomAnnouncementMessages,
  },
  preview: true,
  transition: KeyboardTransition,
}
```

### `announcerClassName`

Screenreader announcements are performed by injecting an element into the DOM with an `aria-live` attribute that gets picked up by the screenreader. By default, this element is visually hidden and kept out of the way, but if you wish to style it in some other way, you can provide a custom class name with this option. The examples page in this repository does this to show the messages on the page for testing.

```typescript
{
  id: 'keyboard',
  backend: KeyboardBackend,
  context: {window, document},
  options: {
    announcerClassName: styles.dndAnnouncer,
  },
  preview: true,
  transition: KeyboardTransition,
}
```

### `previewerClassName`

Similar to the `announcerClassName` this option provides a custom class name to use for the drag previewer, which is a container that gets populated by a clone of the currently-dragged element and positions itself in the appropriate place on screen for the currently-hovered drop target.

```typescript
{
  id: 'keyboard',
  backend: KeyboardBackend,
  context: {window, document},
  options: {
    previewerClassName: styles.dndDragPreview,
  },
  preview: true,
  transition: KeyboardTransition,
}
```

**NOTE:** It is important that this div does _not_ have any styles that affect its spatial positioning on screen, as this is controlled internally by the backend. What it _can_ be used for are things like adding a drop shadow or highlight to the drag preview, changing opacities, borders, scaling, and other stylistic options.

## Considerations

### Ensuring accessible labels

The default announcement messages will look at a few properties to try and create the most relevant label possible for the user. At the highest priority, if you specify a `data-dnd-name` attribute on the target element (either the drag source or the drop target, depending on the operation), that will be used directly. Next, it will look for an `aria-label` on the same element, and finally it will fall back to using the `innerText` of the element itself.

As an example:

```typescript
// This would read out "Picked up Example A" when it is picked up for dragging
<div ref={drag} data-dnd-name="Example A" aria-label="some aria label" />
// This would read out "Over Target B" when the user drags an item over it with the keyboard backend
<dif ref={drop} aria-label="Target B" />
// This would read out "Dropped an element with text inside" when it is dropped on a target
<div ref={drag}>an element with text inside</div>
```

While this _should_ ensure that any item a user picks up or drops has _some_ kind of label on it, falling back to the inner text should be a last resort, and ideally you should add an `aria-label` or at least a `data-dnd-name` to provide a more succinct, helpful label for screenreader users.


### "Sort on "hover"

A common pattern with `react-dnd` is to perform sorting operations in the `hover` callback on drop targets. In fact this is how most of the [react-dnd sorting examples](https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple) operate.

However, this pattern poses a problem for trying to drag and drop with a keyboard, because the user doesn't have the same granularity of control in movement. In the example linked above, sorting happens based on whether the user's mouse is dragging over the upper or lower half of the drop target. A keyboard user wouldn't be able to choose between those positions, so they effectively miss out on some sorting options, or in some cases the sorting won't happen at all since by default the drag operations go over the exact center of the drop target.

Additionally, sorting on hover means that a user "browsing" through drop targets will inadvertently be reorganizing their lists without ever actually dropping an item. If a user picks up an item, drags it up a few places, then decides to cancel the drag, the item will have moved those spaces anyway because the move happened on hover rather than when the item was actually dropped.

The best way to avoid this issue is to just avoid sorting in the `hover` callback and use drag placeholders and other indicators to show where an element will drop. This may involve some refactoring and rethinking designs, but the end result will be more accessible (and often more performant!) for everyone.
