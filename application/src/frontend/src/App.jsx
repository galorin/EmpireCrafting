import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { fetchPotionSets, fetchPotionsInSet, fetchIngredients } from './utils/api';

// Dynamically import components
const IngredientTable = lazy(() => import('./components/IngredientTable'));
const BestPotionsSection = lazy(() => import('./components/BestPotionsSection'));
const SelectedSetsManager = lazy(() => import('./components/SelectedSetsManager'));
const PotionDetailsSection = lazy(() => import('./components/PotionDetailsSection'));
const About = lazy(() => import('./components/About'));
const LegalPopup = lazy(() => import('./components/LegalPopup'));

function App() {
  const [potionSets, setPotionSets] = useState([]);
  const [potionsInSet, setPotionsInSet] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [inventory, setInventory] = useState(() => {
    const savedInventory = localStorage.getItem('inventory');
    return savedInventory ? JSON.parse(savedInventory) : {};
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSets, setSelectedSets] = useState([]);
  const [activeTab, setActiveTab] = useState('main'); // New state for active tab
  const [showLegalPopup, setShowLegalPopup] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('hasConsentedToLocalStorage');
    if (!consent) {
      setShowLegalPopup(true);
    }
  }, []);

  const handleAcceptLegal = () => {
    localStorage.setItem('hasConsentedToLocalStorage', 'true');
    setShowLegalPopup(false);
  };

  const handleDataFetched = useCallback((fetchedIngredients) => {
    setIngredients(fetchedIngredients);
    const newInventory = {};
    fetchedIngredients.forEach(ingredient => {
      newInventory[ingredient.Id] = ingredient.SessionInventory;
    });

    const savedIngredients = localStorage.getItem('ingredients');
    if (!savedIngredients) {
      localStorage.setItem('ingredients', JSON.stringify(fetchedIngredients));
    }

    const savedInventory = localStorage.getItem('inventory');
    if (!savedInventory) {
      localStorage.setItem('inventory', JSON.stringify(newInventory));
      setInventory(newInventory);
    }
  }, []);

  // Fetch Potion Sets
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const potionSetsData = await fetchPotionSets();
        setPotionSets(potionSetsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch Potions for Selected Sets
  useEffect(() => {
    const fetchPotions = async () => {
      if (selectedSets.length === 0) {
        setPotionsInSet([]);
        return;
      }

      try {
        const allPotions = [];
        for (const setId of selectedSets) {
          const potions = await fetchPotionsInSet(setId);
          allPotions.push(...potions);
        }
        setPotionsInSet(allPotions);
      } catch (err) {
        console.error("Error fetching potions:", err);
      }
    };

    fetchPotions();
  }, [selectedSets, inventory]); // Re-run when selectedSets or inventory changes

  useEffect(() => {
    const hasConsented = localStorage.getItem('hasConsentedToLocalStorage') === 'true';
    if (!showLegalPopup && hasConsented) {
      const loadIngredients = async () => {
        try {
          const ingredientsData = await fetchIngredients();
          handleDataFetched(ingredientsData);
        } catch (err) {
          setError(err.message);
        }
      };
      loadIngredients();
    }
  }, [showLegalPopup, handleDataFetched]);

  // Handle Set Selection
  const handleSetSelect = useCallback((setId) => {
    setSelectedSets((prevSelectedSets) => {
      const isChecked = !prevSelectedSets.includes(setId);
      if (isChecked) {
        return [...prevSelectedSets, setId];
      } else {
        return prevSelectedSets.filter((selectedId) => selectedId !== setId);
      }
    });
  }, []);

  if (isLoading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      <div className="tabs">
        <button
          className={`tab-link ${activeTab === 'main' ? 'active' : ''}`}
          onClick={() => setActiveTab('main')}
        >
          Main Application
        </button>
        <button
          className={`tab-link ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>

      <Suspense fallback={<div className="loading-message">Loading application...</div>}>
        {showLegalPopup && <LegalPopup onAccept={handleAcceptLegal} />}
        {activeTab === 'main' && (
          <>
            {/* Potion Sets Section (Known Potions) */}
            <div className="potion-sets-section">
              <SelectedSetsManager
                potionSets={potionSets}
                setPotionsInSet={setPotionsInSet}
                selectedSets={selectedSets}
                onSetSelect={handleSetSelect}
                potionsInSet={potionsInSet}
                ingredients={ingredients}
              />
            </div>

            {/* Ingredients Section (Inventory) */}
            <div className="ingredients-section">
              <IngredientTable ingredients={ingredients} onDataFetched={handleDataFetched} />
            </div>

            {/* Recommended Sets Section (Best Potions and Potion Details) */}
            <div className="recommended-sets-container">
              <div className="best-potions-section-container">
                <BestPotionsSection potions={potionsInSet} ingredients={ingredients} inventory={inventory} />
              </div>
              <div className="potion-details-section">
                <PotionDetailsSection potionsInSet={potionsInSet} ingredients={ingredients} inventory={inventory} />
              </div>
            </div>
          </>
        )}

        {activeTab === 'about' && <About />}
      </Suspense>
    </div>
  );
}

export default App;