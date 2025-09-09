// src/utils/api.ts
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
    const response = await fetch(`/api/ingredients`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.ingredients;
  };

  export const fetchPotionSets = async (): Promise<PotionSet[]> => {
    const response = await fetch(`/api/potionsets`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.sets;
  };

  export const fetchPotionsInSet = async (setId: number): Promise<Potion[]> => {
    const response = await fetch(`/api/potions?set_id=${setId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.potions;
  };
