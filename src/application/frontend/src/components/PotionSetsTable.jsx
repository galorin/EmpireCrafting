// src/components/PotionSetsTable.jsx
import React from 'react';
import { calculatePotionCost, calculatePotionProfit } from '../utils/potionCalculations';

const PotionSetsTable = React.memo(({ potionSets, selectedSets, handleSetSelect, checkboxRefs, potionsInSet, ingredients }) => {
  return (
    <table className="potion-sets-table">
      <thead className="potion-sets-table-header">
        <tr>
          <th className="potion-sets-table-header-cell">Select</th>
          <th className="potion-sets-table-header-cell">Set Information</th>
        </tr>
      </thead>
      <tbody>
        {potionSets.map((set) => {
          const potions = potionsInSet.filter(p => p.SetId === set.Id);
          return (
            <tr key={set.Id} className="potion-sets-table-row">
              <td className="potion-sets-table-cell">
                <input
                  type="checkbox"
                  value={set.Id}
                  checked={selectedSets.includes(set.Id)}
                  onChange={() => handleSetSelect(set.Id)}
                  ref={(el) => checkboxRefs.current[set.Id] = el}
                  aria-label={`Select set ${set.Name}`}
                />
              </td>
              <td className="potion-sets-table-cell">
                <details>
                  <summary className="potion-sets-table-summary">{set.Name}</summary>
                  <p>{set.Description}</p>
                  {potions.length > 0 && (
                    <>
                      <div className="potion-names-container">
                        <strong>Potions in this set:</strong>
                        <ul>
                          {potions.map(potion => (
                            <li key={potion.Id}>{potion.Name}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="potions-grid">
                        {potions.map(potion => {
                          const cost = calculatePotionCost(potion, ingredients);
                          const profitDetails = calculatePotionProfit(potion, ingredients);
                          return (
                            <div key={potion.Id} className="potion-grid-item">
                              <strong>{potion.Name}</strong>
                              <p>Cost: {cost.toFixed(2)}g</p>
                              <p>Sell Price: {profitDetails.sellPrice.toFixed(2)}g</p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </details>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
});

export default PotionSetsTable;