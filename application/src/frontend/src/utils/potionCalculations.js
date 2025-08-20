// src/utils/potionCalculations.js
import { GUILD_PER_INGREDIENT } from './constants';
import { findIngredientByName } from './helpers';

export const calculatePotionCost = (potion, ingredients) => {
  let totalCost = 0;
  if (potion.Ingredients) {
    for (const ingredientName in potion.Ingredients) {
      const ingredient = findIngredientByName(ingredients, ingredientName);
      if (ingredient) {
        totalCost += ingredient.SessionPrice * potion.Ingredients[ingredientName];
      }
    }
  }
  return totalCost;
};

export const calculateGuildCost = (potion) => {
  if (!potion.Ingredients) return GUILD_PER_INGREDIENT;

  let totalIngredients = 0;
  for (const ingredientName in potion.Ingredients) {
    totalIngredients += potion.Ingredients[ingredientName];
  }
  return (totalIngredients + 1) * GUILD_PER_INGREDIENT;
};

export const calculatePotionProfit = (potion, ingredients) => {
  const cost = calculatePotionCost(potion, ingredients);
  const guildCost = calculateGuildCost(potion);
  const baseProfit = cost * 1.25;
  const roundedProfit = Math.ceil(baseProfit / 5) * 5;
  const undercutAmount = guildCost - roundedProfit;
  const profitOverBaseCost = roundedProfit - cost;

  return {
    sellPrice: roundedProfit,
    undercutAmount: undercutAmount,
    profitOverBaseCost: profitOverBaseCost,
  };
};

export const canMakePotion = (potion, currentInventory, ingredients) => {
  if (!potion.Ingredients) return true;
  for (const ingredientName in potion.Ingredients) {
    const ingredient = findIngredientByName(ingredients, ingredientName);
    if (!ingredient) return false; // Ingredient not found
    const ingredientId = ingredient.Id;
    if (currentInventory[ingredientId] < potion.Ingredients[ingredientName]) {
      return false;
    }
  }
  return true;
};

export const consumeIngredients = (potion, currentInventory, ingredients) => {
  if (!potion.Ingredients) return;
  for (const ingredientName in potion.Ingredients) {
    const ingredient = findIngredientByName(ingredients, ingredientName); // Use the ingredients array here
    if (ingredient) {
      const ingredientId = ingredient.Id;
      currentInventory[ingredientId] -= potion.Ingredients[ingredientName];
    }
  }
};

export const calculatePotionScore = (potion, ingredients, weights) => {
  const profitDetails = calculatePotionProfit(potion, ingredients);
  const ingredientCost = calculatePotionCost(potion, ingredients);

  // Normalize values to be between 0 and 1
  const normalizedUndercut = Math.max(0, profitDetails.undercutAmount / 100); // Assuming max undercut is 100
  const normalizedProfit = Math.max(0, profitDetails.profitOverBaseCost / 100); // Assuming max profit is 100
  const normalizedIngredientCost = 1 - Math.min(1, ingredientCost / 100); // Assuming max cost is 100, invert for cheaper

  // Calculate weighted score
  const score =
    weights.undercut * normalizedUndercut +
    weights.profit * normalizedProfit +
    weights.ingredientCost * normalizedIngredientCost;

  return score;
};

export const calculateMarketValueScore = (potion, ingredients, weights) => {
  const profitDetails = calculatePotionProfit(potion, ingredients);

  // Find the ingredient with the highest price and lowest inventory
  let maxPrice = 0;
  let minInventory = Infinity;
  for (const ingredientName in potion.Ingredients) {
    const ingredient = findIngredientByName(ingredients, ingredientName);
    if (ingredient) {
      maxPrice = Math.max(maxPrice, ingredient.SessionPrice);
      minInventory = Math.min(minInventory, ingredient.SessionInventory);
    }
  }

  // Normalize values
  const normalizedUndercut = Math.max(0, profitDetails.undercutAmount / 100);
  const normalizedPrice = Math.max(0, maxPrice / 500); // Assuming max price is 500
  const normalizedInventory = 1 - Math.min(1, minInventory / 100); // Assuming max inventory is 100, inverted

  // Calculate weighted score
  const score =
    weights.undercut * normalizedUndercut +
    weights.price * normalizedPrice +
    weights.inventory * normalizedInventory;

  return score;
};

export const calculateMaxPotions = (potions, inventory, ingredients) => {
  let currentInventory = JSON.parse(JSON.stringify(inventory));
  const craftedPotions = [];

  // Add ingredient count to each potion
  const potionsWithIngredientCount = potions.map(potion => {
    let ingredientCount = 0;
    if (potion.Ingredients) {
      for (const ingredientName in potion.Ingredients) {
        ingredientCount += potion.Ingredients[ingredientName];
      }
    }
    return { ...potion, ingredientCount };
  });

  // Sort potions by ingredient count (ascending)
  potionsWithIngredientCount.sort((a, b) => a.ingredientCount - b.ingredientCount);

  let potionMadeInLoop = true;
  while (potionMadeInLoop) {
    potionMadeInLoop = false;
    for (const potion of potionsWithIngredientCount) {
      if (canMakePotion(potion, currentInventory, ingredients)) {
        consumeIngredients(potion, currentInventory, ingredients);
        const existingPotion = craftedPotions.find(p => p.Id === potion.Id);
        if (existingPotion) {
          existingPotion.quantity = (existingPotion.quantity || 1) + 1;
        } else {
          craftedPotions.push({ ...potion, quantity: 1 });
        }
        potionMadeInLoop = true;
      }
    }
  }

  return craftedPotions;
};