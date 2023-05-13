import * as React from "react";

import { useDrag, useDrop } from "react-dnd";
import { ItemTypes } from "./ItemTypes";

const style: React.CSSProperties = {
  position: "relative",
  border: "1px dashed gray",
  padding: "0.5rem 1rem",
  marginBottom: ".5rem",
  backgroundColor: "white",
  cursor: "move",
};

const dropTargetAboveStyle: React.CSSProperties = {
  position: "absolute",
  top: -8,
  left: -8,
  right: -8,
  border: "2px solid #00ff00",
};

const dropTargetBelowStyle: React.CSSProperties = {
  position: "absolute",
  bottom: -8,
  left: -8,
  right: -8,
  border: "2px solid #00ff00",
};

export interface SortableCardProps {
  id: any;
  text: string;
  index: number;
  moveCard: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  id: string;
  type: string;
}

export function SortableCard({ id, text, index, moveCard }: SortableCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver, isAbove, isBelow }, drop] = useDrop(() => ({
    accept: [ItemTypes.CARD],
    drop(item: DragItem) {
      moveCard(item.index, index);
    },
    collect(monitor) {
      const dragIndex = monitor.getItem()?.index ?? -1;
      return {
        isOver: monitor.isOver(),
        isAbove: dragIndex > index,
        isBelow: dragIndex < index,
      };
    },
  }));

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{ ...style, opacity }} tabIndex={0}>
      {isOver && isAbove ? <div style={dropTargetAboveStyle} /> : null}
      {text}
      {isOver && isBelow ? <div style={dropTargetBelowStyle} /> : null}
    </div>
  );
}
