// src/utils/helpers.ts
interface Ingredient {
  Id: number;
  Name: string;
  SessionPrice: number;
  SessionInventory: number;
}

export const findIngredientByName = (ingredients: Ingredient[], ingredientName: string): Ingredient | undefined => {
  return ingredients.find(ing => ing.Name.toLowerCase() === ingredientName.toLowerCase());
};
