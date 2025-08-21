// src/utils/api.js
export const fetchIngredients = async () => {
    const response = await fetch(`/api/ingredients`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.ingredients;
  };
  
  export const fetchPotionSets = async () => {
    const response = await fetch(`/api/potionsets`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.sets;
  };
  
  export const fetchPotionsInSet = async (setId) => {
    const response = await fetch(`/api/potions?set_id=${setId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.potions;
  };