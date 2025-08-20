// src/components/IngredientList.jsx
import React from 'react';

const IngredientList = React.memo(({ potion }) => { // Removed inventory
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

export default IngredientList;
