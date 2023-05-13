import * as React from "react";
import { createRoot } from "react-dom/client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MultiBackend, createTransition } from "react-dnd-multi-backend";

import KeyboardBackend, { isKeyboardDragTrigger } from "react-dnd-accessible-backend";

import SortableContainer from "./sortable/SortableContainer";

const KeyboardTransition = createTransition("keydown", (event) => {
  if (!isKeyboardDragTrigger(event as KeyboardEvent)) return false;
  // This prevention keeps the first keyboard event from causing browser
  // bookmark shortcuts. This can't be done in the Backend because it only
  // receives a _cloned_ event _after_ this one has already propagated.
  event.preventDefault();
  return true;
});

const MouseTransition = createTransition("mousedown", (event) => {
  if (event.type.indexOf("touch") !== -1 || event.type.indexOf("mouse") === -1) return false;
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
      options: {},
      preview: true,
      transition: KeyboardTransition,
    },
  ],
};

function Index() {
  return (
    <DndProvider backend={MultiBackend} options={DND_OPTIONS}>
      <h1>Keyboard Drag and Drop Example</h1>

      <p>
        This example is a clone of react-dnd's{" "}
        <a href="https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple">
          Simple sortable example
        </a>
        , but with the accessible backend plugged in to automatically support keyboards and
        screenreaders.
      </p>

      <p>
        Just like the original, you can use this example with a mouse and dragging around, but you
        can also tab between the items and move them with a keyboard.
      </p>

      <p>
        To pick up an item with the keyboard, use{" "}
        <span style={{ fontFamily: "monospace" }}>ctrl+d</span> (or{" "}
        <span style={{ fontFamily: "monospace" }}>command+d</span> on macOS) while focused on it,
        then press the up and down arrows to move between targets, and the enter key to drop the
        item where it is currently hovered. You can also cancel dragging at any time by pressing{" "}
        <span style={{ fontFamily: "monospace" }}>Escape</span>.
      </p>

      <p>
        Below this example, you can see the screenreader announcements happen in real time as you
        move around. Note that these announcements only happen when using a keyboard to drag and
        drop. By default these are visually hidden, but they have been made visible for this
        example.
      </p>
      <SortableContainer />
    </DndProvider>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<Index />);
