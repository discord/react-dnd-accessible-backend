import * as React from "react";
import { SortableCard } from "./SortableCard";

const style = {
  width: 400,
};

export interface Item {
  id: number;
  text: string;
}

export interface ContainerState {
  cards: Item[];
}

export default function SortableContainer() {
  {
    const [cards, setCards] = React.useState([
      { id: 1, text: "Write a cool JS library" },
      { id: 2, text: "Make it generic enough" },
      { id: 3, text: "Write README" },
      { id: 4, text: "Create some examples" },
      {
        id: 5,
        text: "Spam in Twitter and IRC to promote it (note that this element is taller than the others)",
      },
      { id: 6, text: "???" },
      { id: 7, text: "PROFIT" },
    ]);

    const moveCard = React.useCallback(
      (draggedId: number, hoveredId: number) => {
        const newCards = [...cards];
        const dragIndex = cards.findIndex((card) => card.id === draggedId);
        const [dragged] = newCards.splice(dragIndex, 1);
        const hoverIndex = cards.findIndex((card) => card.id === hoveredId);
        newCards.splice(hoverIndex, 0, dragged);

        setCards(newCards);
      },
      [cards],
    );

    return (
      <div style={style}>
        {cards.map((card) => (
          <SortableCard key={card.id} id={card.id} text={card.text} moveCard={moveCard} />
        ))}
      </div>
    );
  }
}
