// src/utils/api.ts

// This placeholder will be replaced by the entrypoint.sh script in the Docker container.
// In a local dev environment, this will default to /api, assuming a dev server proxy is configured.
const API_BASE_URL = '__VITE_API_BASE_URL__';

interface Ingredient {
  Id: number;
  Name: string;
  SessionPrice: number;
  SessionInventory: number;
}

interface PotionSet {
  id: number;
  name: string;
}

interface Potion {
  Id: number;
  Name: string;
  Ingredients: { [key: string]: number };
}

export const fetchIngredients = async (): Promise<Ingredient[]> => {
    const response = await fetch(`${API_BASE_URL}/ingredients`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.ingredients;
  };

  export const fetchPotionSets = async (): Promise<PotionSet[]> => {
    const response = await fetch(`${API_BASE_URL}/potionsets`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.sets;
  };

  export const fetchPotionsInSet = async (setId: number): Promise<Potion[]> => {
    const response = await fetch(`${API_BASE_URL}/potions?set_id=${setId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.potions;
  };
