// src/components/IngredientList.jsx
import React from 'react';
import PropTypes from 'prop-types';

const IngredientList = React.memo(function IngredientList({ potion }) { // Removed inventory
  return (
    <ul>
      {Object.entries(potion.Ingredients).map(([ingredientName, quantity]) => (
        <li key={ingredientName}>
          {quantity} {ingredientName}
        </li>
      ))}
    </ul>
  );
});

IngredientList.displayName = 'IngredientList';

IngredientList.propTypes = {
  potion: PropTypes.shape({
    Ingredients: PropTypes.objectOf(PropTypes.number).isRequired,
  }).isRequired,
};

export default IngredientList;
