import React from 'react';
import TitledDivider from './TitledDivider';
import CardObj from './../CardObj';

function CardSection(props) {
  if (!props.cards || props.cards.length < 1) {
    return null;
  }
  return (
    <div className="fullWidth mt-3">
      <TitledDivider title={props.title} />
      <div className="fullWidth centerAlign">
        {props.cards.map(card => {
          return <CardObj simpleView={props.simpleView} card={card} key={card.name} count={props.deckAmount ? props.deckAmount[card.name] : 0} onRemove={props.decrementCard} onIncrement={props.incrementCard} onMain={props.onMain} subtract={props.subtract} usePointSystem={props.usePointSystem} />
        })}
      </div>
    </div>
  );
}

export default CardSection;