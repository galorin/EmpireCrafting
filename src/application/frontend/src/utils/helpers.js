// src/utils/helpers.js
export const findIngredientByName = (ingredients, ingredientName) => {
  return ingredients.find(ing => ing.Name.toLowerCase() === ingredientName.toLowerCase());
};
