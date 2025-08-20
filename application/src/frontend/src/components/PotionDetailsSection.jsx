// src/components/PotionDetailsSection.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { calculatePotionCost } from '../utils/potionCalculations';
import IngredientList from './IngredientList';

const PotionDetailsSection = React.memo(function PotionDetailsSection({ potionsInSet, ingredients }) {
  return (
    <div className="potion-details-section">
      <h2 className="section-heading">Potions in selected sets</h2>
      {potionsInSet.length > 0 ? (
        <ul className="potion-list">
          {potionsInSet.map((potion) => (
            <li key={potion.Id} className="potion-list-item">
              <span className="potion-name">{potion.Name}</span> (Cost: {calculatePotionCost(potion, ingredients)})
              <ul className="potion-sublist">
                <li>Form: {potion.Form}</li>
                <li>Lore: {potion.Lore}</li>
                {potion.Ingredients && Object.keys(potion.Ingredients).length > 0 && (
                  <li>
                    <b>Ingredients:</b>
                    <IngredientList potion={potion} ingredients={ingredients} />
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No potions found in this set.</p>
      )}
    </div>
  );
});

PotionDetailsSection.displayName = 'PotionDetailsSection';

PotionDetailsSection.propTypes = {
  potionsInSet: PropTypes.arrayOf(PropTypes.object).isRequired,
  ingredients: PropTypes.object.isRequired,
};

export default PotionDetailsSection;
