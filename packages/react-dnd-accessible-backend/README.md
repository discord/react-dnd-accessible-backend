# react-dnd-accessible-backend

An add-on backend for [`react-dnd`](https://react-dnd.github.io/react-dnd/about) that provides
support for keyboards and screenreaders by default. Keep writing the same drag and drop code while
enabling more users to interact with your app.

## Why

`react-dnd` (and the system of packages it manages) does not directly support drag and drop other
than using a mouse (or a finger on mobile devices). It encapsulates the
[HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API),
which _could_ support other input devices, but most browser implementations today only support
pointers. `react-dnd` also does not provide any way of notifying screenreaders that drag and drop
operations are happening. Again, the HTML5 API makes this _possible_, but it is not supported in any
meaningful way.

Other drag and drop implementations out there _do_ support these features, such as
[`react-beautiful-dnd`](https://github.com/atlassian/react-beautiful-dnd) and
[`dndkit`](https://dndkit.com/), and they do it well. However, `react-dnd` remains by far the most
popular drag and drop library for React applications and is likely stay in that position for a while
as migrating between them is not easy, and the limitations of other systems keep many complex
applications from moving at all.

This package brings support for both alternative input devices like keyboards (or anything that can
trigger keyboard events in the browser) as well as announcements for screenreaders to `react-dnd`
natively, without changing any of the public API that developers are used to or limiting of the
structural flexibility it is known for.

## Installation

This package is available on npm as `react-dnd-accessible-backend`.

```shell
npm install react-dnd-accessible-backend
```

## Basic Usage

`react-dnd-accessible-backend` is not a _replacement_ backend for `react-dnd`, but rather an
_additional_ one. This means you will most likely need to compose backends together to get all of
the functionality you would like (mouse dragging, keyboards, pointer dragging on mobile, etc).

One of the easiest ways to do this is with
[`react-dnd-multi-backend`](https://www.npmjs.com/package/react-dnd-multi-backend) and it's
Transition system. Using that library, just add another backend entry and create a Transition for
the keyboard trigger, like so:

```typescript
import KeyboardBackend, { isKeyboardDragTrigger } from "react-dnd-accessible-backend";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MultiBackend, createTransition } from "react-dnd-multi-backend";

const KeyboardTransition = createTransition("keydown", (event) => {
  if (!isKeyboardDragTrigger(event as KeyboardEvent)) return false;
  event.preventDefault();
  return true;
});

const DND_OPTIONS = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: "keyboard",
      backend: KeyboardBackend,
      context: { window, document },
      options: { preview: true },
      transition: KeyboardTransition,
    },
  ],
};

function App() {
  return (
    <DndProvider backend={MultiBackend} options={DND_OPTIONS}>
      ...
    </DndProvider>
  );
}
```

That's all it takes to get started! There are a few [considerations](#considerations) you'll want to
keep in mind to ensure a really good experience for your users, but everything else should be
automatic.

At the moment, the keybinds used for drag and drop are hard-coded as:

- `ctrl+d` (`command+d` on macOS) to pick up a draggable item
- up and down arrow keys to move between drop targets
- `Enter` or `Spacebar` to drop the dragged item on a drop target
- `Escape` while dragging to cancel the drag operation

## Options

`react-dnd-accessible-backend` provides a few options for customizing styles and behavior for use in
your app. If you're using `react-dnd-multi-backend`, these can get passed in as an `options` field
on the backend configuration object, or otherwise as the third argment when calling the backend
directly as a factory function (like `KeyboardBackend(manager, context, options)`.

These options are:

### `getAnnouncementMessages?: () => AnnouncementMessages`

This function is called any time a drag and drop action is performed by the keyboard backend and is
useful for providing translations or more descriptive messages for screenreader users as they
interact with draggable items.

If this option is not provided, a
[default set of messages in English](https://github.com/discord/react-dnd-accessible-backend/blob/main/src/util/AnnouncementMessages.tsx#L16-L37)
will be used. Providing a separate function requires that you specify a replacement for _all_
messages that can be announced. These (currently) are `pickedUpItem`, `droppedItem`, `hoveredTarget`
and `canceledDrag`.

Each message getter is defined as a function that takes in an `itemId` and the HTML `node` that is
relevant to the operation.

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
  options: {
    getAnnouncementMessages: getCustomAnnouncementMessages,
  },
}
```

### `isDragTrigger?: (event: KeyboardEvent, isFirstEvent: boolean) => boolean`

This function is used to determine if a keyboard event that occurs on a draggable element should
trigger the start of a drag operation. Overriding this option lets you customize the keybind used to
start dragging or perform other checks before the drag is allowed to start.

If this option is not provided, it will default to using the `isKeyboardDragTrigger` that is
exported as part of this package, which triggers when `ctrl/command+d` is pressed.

Ths `isFirstEvent` parameter indicates whether this is the first event the backend is receiving
after being setup.

```typescript
{
  options: {
    // This will start a drag whenever the users presses
    // `m` while focused on a draggable element.
    isDragTrigger: (event) => event.key === "m"
  },
}
```

**NOTE:** In most cases when `react-dnd-multi-backend`, you'll want to use the same trigger function
in this option for the trigger in `createTransition`. Otherwise the backend may not be set up when
you expect to start a drag. This is also where the `isFirstEvent` property can come in handy, since
`react-dnd-multi-backend` will sometimes fire cloned events that don't have keyboard properties on
them. See the comment in
[`isKeyboardDragTrigger`](https://github.com/discord/react-dnd-accessible-backend/blob/6b7413eed66630b5e8e00864c9a282124a9e484e/src/util/isKeyboardDragTrigger.tsx#L5-L10)
for more information.

### `announcer`

By default, `react-dnd-accessible-backend` will append an `aria-live` area to the DOM to provide
screen-reader announcements, powered by
[`@react-aria/live-announcer`](https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/live-announcer/src/LiveAnnouncer.tsx).

If you already have a comparable announcer utility in your app, then you can use the `announcer`
option to replace `DragAnnouncer`'s announcer with your own. **Pease note that multiple `aria-live`
areas in an app or web page could conflict**, which is why we have provided this override option to
re-use any existing `aria-live` announcers.

```typescript
interface Announcer {
  announce(message: string, assertiveness?: 'assertive' | 'polite', timeout?: number): void;
  clearAnnouncements(assertiveness?: 'assertive' | 'polite'): void;
}

const LiveAnnouncer = require('@react-aria/live-announcer');
const AccessibilityAnnouncer: Announcer = {
  announce: LiveAnnouncer.announce,
  clearAnnouncements: LiveAnnouncer.clearAnnouncer,
};

{
  options: {
    announcer: AccessibilityAnnouncer,
  },
}
```

### `previewerClassName`

Similar to the `announcerClassName` this option provides a custom class name to use for the drag
previewer, which is a container that gets populated by a clone of the currently-dragged element and
positions itself in the appropriate place on screen for the currently-hovered drop target.

```typescript
{
  options: {
    previewerClassName: styles.dndDragPreview,
  },
}
```

**NOTE:** It is important that this div does _not_ have any styles that affect its spatial
positioning on screen, as this is controlled internally by the backend. What it _can_ be used for
are things like adding a drop shadow or highlight to the drag preview, changing opacities, borders,
scaling, and other stylistic options.

### `preview`

Control whether drag previews are rendered for this backend.

`react-dnd-multi-backend` provides a configuration field, `preview`, when creating the backend
pipeline, which determines whether previews are enabled or hidden when using a given backend.
However, this only works by introspecting the MultiBackend manager when rendering a Preview from
inside of a React component context (it relies on the Context API to access the backend manager and
read the option).

Because this library renders its own previews _outside_ of React, it has no access to the context,
and can't get access to the MultiBackend instance to read that configuration.

Instead, if you would like to hide the automatically-created previews when using this backend, pass
this configuration under the `options` object:

```typescript
{
  options: {
    preview: false;
  }
}
```

### `announcerClassName` (deprecated)

Deprecated in version 2. To customize the presentation of drag-and-drop announcements, you can now
use the `announcer` option to build your own custom announcer.

`react-dnd-accessible-backend` uses
[`@react-aria/live-announcer`](https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/live-announcer/src/LiveAnnouncer.tsx)
as its default announcer, which visually hides all announcements.

```typescript
{
  options: {
    announcerClassName: styles.dndAnnouncer,
  },
}
```

## Considerations

### Ensuring accessible labels

The default announcement messages will look at a few properties to try and create the most relevant
label possible for the user. At the highest priority, if you specify a `data-dnd-name` attribute on
the target element (either the drag source or the drop target, depending on the operation), that
will be used directly. Next, it will look for an `aria-label` on the same element, and finally it
will fall back to using the `innerText` of the element itself.

As an example:

```typescript
// This would read out "Picked up Example A" when it is picked up for dragging
<div ref={drag} data-dnd-name="Example A" aria-label="some aria label" />
// This would read out "Over Target B" when the user drags an item over it with the keyboard backend
<dif ref={drop} aria-label="Target B" />
// This would read out "Dropped an element with text inside" when it is dropped on a target
<div ref={drag}>an element with text inside</div>
```

While this _should_ ensure that any item a user picks up or drops has _some_ kind of label on it,
falling back to the inner text should be a last resort, and ideally you should add an `aria-label`
or at least a `data-dnd-name` to provide a more succinct, helpful label for screenreader users.

### "Sort on "hover"

A common pattern with `react-dnd` is to perform sorting operations in the `hover` callback on drop
targets. In fact this is how most of the
[react-dnd sorting examples](https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple)
operate.

However, this pattern poses a problem for trying to drag and drop with a keyboard, because the user
doesn't have the same granularity of control in movement. In the example linked above, sorting
happens based on whether the user's mouse is dragging over the upper or lower half of the drop
target. A keyboard user wouldn't be able to choose between those positions, so they effectively miss
out on some sorting options, or in some cases the sorting won't happen at all since by default the
drag operations go over the exact center of the drop target.

Additionally, sorting on hover means that a user "browsing" through drop targets will inadvertently
be reorganizing their lists without ever actually dropping an item. If a user picks up an item,
drags it up a few places, then decides to cancel the drag, the item will have moved those spaces
anyway because the move happened on hover rather than when the item was actually dropped.

The best way to avoid this issue is to just avoid sorting in the `hover` callback and use drag
placeholders and other indicators to show where an element will drop. This may involve some
refactoring and rethinking designs, but the end result will be more accessible (and often more
performant!) for everyone.

# Thanks to

- [`react-dnd-keyboard-backend`](https://github.com/mmissey/react-dnd-keyboard-backend) as an
  inspiration and proof-of-concept for keyboard-based backends.
- [`react-dnd-multi-backend`](https://github.com/LouisBrunner/dnd-multi-backend/tree/main/packages/react-dnd-multi-backend)
  for making it possible to compose backends together.
- [`react-beautiful-dnd`](https://github.com/atlassian/react-beautiful-dnd) as a guiding example of
  what a good keyboard-based dnd interface could feel like.
- [`@react-aria/live-announcer`](https://github.com/adobe/react-spectrum/blob/main/packages/@react-aria/live-announcer/src/LiveAnnouncer.tsx)
  and the [React Aria Team](https://react-spectrum.adobe.com/react-aria/) who are dedicated to
  creating accessible components and tools.
