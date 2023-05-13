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
  moveCard: (draggedId: number, hoveredId: number) => void;
}

interface DragItem {
  index: number;
  id: number;
  type: string;
}

export function SortableCard({ id, text, moveCard }: SortableCardProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.CARD],
    drop(item: DragItem) {
      moveCard(item.id, id);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <div ref={ref} style={{ ...style, opacity }} tabIndex={0}>
      {isOver ? <div style={dropTargetAboveStyle} /> : null}
      {text}
    </div>
  );
}
