// src/components/SelectedSetsManager.jsx
import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import PotionSetsTable from './PotionSetsTable';

const SelectedSetsManager = ({ potionSets, selectedSets, onSetSelect, potionsInSet, ingredients }) => {
  const checkboxRefs = useRef({});

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
  selectedSets: PropTypes.array.isRequired,
  onSetSelect: PropTypes.func.isRequired,
  potionsInSet: PropTypes.array.isRequired,
  ingredients: PropTypes.array.isRequired,
};

export default SelectedSetsManager;
