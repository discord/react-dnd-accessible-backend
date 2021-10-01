This example sortable list is copied from
https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple.

With only a few modifications:

- `SortableCard` was given a `tabIndex` of `0` to support tabbing between the list items and start
  keyboard dragging.
- Sorting only happens on _drop_ rather than on _hover_. Hover-based drops are often implemented
  based on mouse cursor position and assume an ability to position an item above or below a certain
  point to determine where the item is currently hovered. Sorting at drop time is much more
  consistent between input methods.
- Minor style tweaks to make the sort-on-drop behavior more apparent.
