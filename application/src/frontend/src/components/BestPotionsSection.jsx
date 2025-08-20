import { calculatePotionProfit, canMakePotion, consumeIngredients, calculateMarketValueScore, calculateMaxPotions } from '../utils/potionCalculations';
import { useState } from 'react';

const PotionList = ({ potions, ingredients, expandedPotionId, togglePotionDetails }) => (
  <div className="potions-accordion">
    {potions.map((potion) => (
      <div key={potion.Id} className="potion-card">
        <button className="potion-header" onClick={() => togglePotionDetails(potion.Id)}>
          <span className="potion-name">{potion.Name}{potion.quantity > 1 ? ` (x${potion.quantity})` : ''}</span>
          <span className="potion-sell-price">Sell Price: {calculatePotionProfit(potion, ingredients).sellPrice.toFixed(2)}g</span>
        </button>
        {expandedPotionId === potion.Id && (
          <div className="potion-details-callout">
            <h4>Profit Breakdown</h4>
            <ul className="details-list">
              <li>Sell Price: <span>{calculatePotionProfit(potion, ingredients).sellPrice.toFixed(2)}g</span></li>
              <li>Profit Over Base Cost: <span>{calculatePotionProfit(potion, ingredients).profitOverBaseCost.toFixed(2)}g</span></li>
              <li>Undercut Amount: <span>{calculatePotionProfit(potion, ingredients).undercutAmount.toFixed(2)}g</span></li>
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
);

const AuditLog = ({ potions, ingredients, initialInventory }) => {
  const ingredientsUsed = {};
  for (const potion of potions) {
    for (let i = 0; i < (potion.quantity || 1); i++) {
      for (const ingredientName in potion.Ingredients) {
        ingredientsUsed[ingredientName] = (ingredientsUsed[ingredientName] || 0) + potion.Ingredients[ingredientName];
      }
    }
  }

  const remainingInventory = { ...initialInventory };
  for (const ingredientName in ingredientsUsed) {
    const ingredient = ingredients.find(i => i.Name === ingredientName);
    if (ingredient) {
      remainingInventory[ingredient.Id] -= ingredientsUsed[ingredientName];
    }
  }

  return (
    <div className="audit-log-container">
      <h3 className="section-heading">Audit Log</h3>
      <div className="audit-log-columns">
        <div className="audit-log-column">
          <h4>Ingredients Used</h4>
          <ul>
            {Object.entries(ingredientsUsed).map(([name, quantity]) => (
              <li key={name}>{name}: {quantity}</li>
            ))}
          </ul>
        </div>
        <div className="audit-log-column">
          <h4>Remaining Inventory</h4>
          <ul>
            {Object.entries(remainingInventory).map(([id, quantity]) => {
              if (quantity > 0) {
                const ingredient = ingredients.find(i => i.Id === parseInt(id));
                return <li key={id}>{ingredient ? ingredient.Name : 'Unknown'}: {quantity}</li>;
              }
              return null;
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

const BestPotionsSection = ({ potions, ingredients, inventory }) => {
  const [expandedPotionId, setExpandedPotionId] = useState(null);
  const [activeTab, setActiveTab] = useState('oneOfEach');

  // Guard against incomplete data.
  if (!potions || !ingredients || !inventory || potions.length === 0) {
    return (
      <div className="best-potions-section-container">
        <h2 className="section-heading">Best Potions to Make</h2>
        <p>Select a potion set to see recommendations.</p>
      </div>
    );
  }

  const weights = {
    undercut: 0.4,
    price: 0.3,
    inventory: 0.3,
  };

  const togglePotionDetails = (potionId) => {
    setExpandedPotionId(currentId => (currentId === potionId ? null : potionId));
  };

  const renderTabContent = () => {
    const initialInventory = JSON.parse(JSON.stringify(inventory));

    switch (activeTab) {
      case 'oneOfEach': {
        const oneOfEachInventory = JSON.parse(JSON.stringify(inventory));
        const oneOfEachPotions = [];
        const sortedPotionsForOneOfEach = potions
          .map(potion => ({
            ...potion,
            profitDetails: calculatePotionProfit(potion, ingredients),
            score: calculateMarketValueScore(potion, ingredients, weights),
          }))
          .sort((a, b) => b.score - a.score);

        for (const potion of sortedPotionsForOneOfEach) {
          if (canMakePotion(potion, oneOfEachInventory, ingredients)) {
            oneOfEachPotions.push(potion);
            consumeIngredients(potion, oneOfEachInventory, ingredients);
          }
        }
        return (
          <>
            <PotionList potions={oneOfEachPotions} ingredients={ingredients} expandedPotionId={expandedPotionId} togglePotionDetails={togglePotionDetails} />
            <AuditLog potions={oneOfEachPotions} ingredients={ingredients} initialInventory={initialInventory} />
          </>
        );
      }
      case 'bestPotions': {
        const bestPotions = [];
        let currentInventory = JSON.parse(JSON.stringify(inventory));
        let bestPotion;
        const madePotionIds = [];
        do {
          const makeablePotions = potions.filter(potion => canMakePotion(potion, currentInventory, ingredients) && !madePotionIds.includes(potion.Id));
          const scoredPotions = makeablePotions.map(potion => ({
            ...potion,
            profitDetails: calculatePotionProfit(potion, ingredients),
            score: calculateMarketValueScore(potion, ingredients, weights),
          }));
          scoredPotions.sort((a, b) => b.score - a.score);
          bestPotion = scoredPotions.length > 0 ? scoredPotions[0] : null;

          if (bestPotion) {
            bestPotions.push(bestPotion);
            madePotionIds.push(bestPotion.Id);
            consumeIngredients(bestPotion, currentInventory, ingredients);
          }
        } while (bestPotion);

        const consolidatedPotions = bestPotions.reduce((acc, potion) => {
          const existingPotion = acc.find(p => p.Id === potion.Id);
          if (existingPotion) {
            existingPotion.quantity = (existingPotion.quantity || 1) + 1;
          } else {
            acc.push({ ...potion, quantity: 1 });
          }
          return acc;
        }, []);

        return (
          <>
            <PotionList potions={consolidatedPotions} ingredients={ingredients} expandedPotionId={expandedPotionId} togglePotionDetails={togglePotionDetails} />
            <AuditLog potions={bestPotions} ingredients={ingredients} initialInventory={initialInventory} />
          </>
        );
      }
      case 'maxPotions': {
        const maxPotions = calculateMaxPotions(potions, inventory, ingredients);
        return (
          <>
            <PotionList potions={maxPotions} ingredients={ingredients} expandedPotionId={expandedPotionId} togglePotionDetails={togglePotionDetails} />
            <AuditLog potions={maxPotions} ingredients={ingredients} initialInventory={initialInventory} />
          </>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="best-potions-section-container">
      <div className="tabs">
        <button className={`tab-link ${activeTab === 'oneOfEach' ? 'active' : ''}`} onClick={() => setActiveTab('oneOfEach')}>One of Each</button>
        <button className={`tab-link ${activeTab === 'bestPotions' ? 'active' : ''}`} onClick={() => setActiveTab('bestPotions')}>Best Potions to Make</button>
        <button className={`tab-link ${activeTab === 'maxPotions' ? 'active' : ''}`} onClick={() => setActiveTab('maxPotions')}>Maximum Potions</button>
      </div>
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default BestPotionsSection;
