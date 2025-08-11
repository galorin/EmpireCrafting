// src/utils/api.js
export const fetchIngredients = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ingredients`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.ingredients;
  };
  
  export const fetchPotionSets = async () => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/potionsets`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.sets;
  };
  
  export const fetchPotionsInSet = async (setId) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/potions?set_id=${setId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.potions;
  };