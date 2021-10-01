import * as React from "react";
import { SortableCard } from "./SortableCard";
import update from "immutability-helper";

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
        text:
          "Spam in Twitter and IRC to promote it (note that this element is taller than the others)",
      },
      { id: 6, text: "???" },
      { id: 7, text: "PROFIT" },
    ]);

    const moveCard = React.useCallback(
      (dragIndex: number, hoverIndex: number) => {
        const dragCard = cards[dragIndex];
        setCards(
          update(cards, {
            $splice: [
              [dragIndex, 1],
              [hoverIndex, 0, dragCard],
            ],
          }),
        );
      },
      [cards],
    );

    return (
      <div style={style}>
        {cards.map((card, index) => (
          <SortableCard
            key={card.id}
            index={index}
            id={card.id}
            text={card.text}
            moveCard={moveCard}
          />
        ))}
      </div>
    );
  }
}
