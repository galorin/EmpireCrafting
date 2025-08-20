// src/components/SelectedSetsManager.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import PotionSetsTable from './PotionSetsTable';
import { fetchPotionsInSet } from '../utils/api';

const SelectedSetsManager = ({ potionSets, setPotionsInSet, selectedSets, onSetSelect, potionsInSet, ingredients }) => {
  const checkboxRefs = useRef({});

  // Fetch Potions for All Sets on Mount
  useEffect(() => {
    const fetchAllPotions = async () => {
      if (potionSets.length === 0) return;

      try {
        const allPotions = [];
        for (const set of potionSets) {
          const potions = await fetchPotionsInSet(set.Id);
          allPotions.push(...potions);
        }
        setPotionsInSet(allPotions);
      } catch (err) {
        console.error("Error fetching all potions:", err);
      }
    };

    fetchAllPotions();
  }, [potionSets, setPotionsInSet]);

  // Handle Checkbox Change
  const handleSetSelect = useCallback((setId) => {
    onSetSelect(setId); // Call the callback function
  }, [onSetSelect]);

  return (
    <div className="potion-sets-manager-container">
      <h2 className="section-heading">Known Sets</h2>
      {potionSets.length > 0 ? (
        <PotionSetsTable
          potionSets={potionSets}
          selectedSets={selectedSets}
          handleSetSelect={handleSetSelect}
          checkboxRefs={checkboxRefs}
          potionsInSet={potionsInSet}
          ingredients={ingredients}
        />
      ) : (
        <p className="loading-message">Loading Potion Sets...</p>
      )}
    </div>
  );
};
SelectedSetsManager.propTypes = {
  potionSets: PropTypes.array.isRequired,
  setPotionsInSet: PropTypes.func.isRequired,
  selectedSets: PropTypes.array.isRequired,
  onSetSelect: PropTypes.func.isRequired,
  potionsInSet: PropTypes.array.isRequired,
  ingredients: PropTypes.array.isRequired,
};

export default SelectedSetsManager;
