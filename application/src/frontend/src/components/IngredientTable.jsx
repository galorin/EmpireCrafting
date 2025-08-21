// src/components/IngredientTable.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const IngredientTable = ({ onDataFetched }) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIngredients = useCallback(async () => {
    try {
      const response = await fetch('/api/ingredients');
      const text = await response.text();
      console.log("Raw response:", text);
      const json = JSON.parse(text);
      const ingredientsData = json.ingredients || [];
      setRowData(ingredientsData);
      if (onDataFetched) {
        onDataFetched(ingredientsData);
      }
    } catch (error) {
      console.error("Failed to fetch ingredients:", error);
    } finally {
      setLoading(false);
    }
  }, [onDataFetched]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const updateIngredient = useCallback(async (updatedData) => {
    const { Id, SessionPrice, SessionInventory } = updatedData;
    if (SessionPrice < 0 || SessionInventory < 0) {
      console.error("Validation failed: price or inventory cannot be negative");
      return;
    }

    try {
      const response = await fetch('/api/ingredients/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredient_id: Id,
          session_price: parseInt(SessionPrice, 10),
          session_inventory: parseInt(SessionInventory, 10)
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg);
      } else {
        fetchIngredients();
      }
    } catch (error) {
      console.error("Error updating ingredient:", error);
    }
  }, [fetchIngredients]);

  const onCellValueChanged = useCallback((params) => {
    updateIngredient(params.data);
  }, [updateIngredient]);

  const columns = [
    { field: 'Name', headerName: 'Name', editable: false, flex: 1 },
    {
      field: 'SessionPrice',
      headerName: 'Price',
      editable: true,
      type: 'numericColumn',
      cellEditor: 'agNumberCellEditor',
      flex: 1
    },
    {
      field: 'SessionInventory',
      headerName: 'Inventory',
      editable: true,
      type: 'numericColumn',
      cellEditor: 'agNumberCellEditor',
      flex: 1
    },
  ];

  return (
    <>
      <h1 className="section-heading">Ingredients</h1>
      {loading ? (
        <p className="loading-message">Loading Ingredients...</p>
      ) : (
        <div className="ingredient-table-container ag-theme-alpine">
          <AgGridReact
            rowData={rowData}
            columnDefs={columns}
            defaultColDef={{ resizable: true }}
            onCellValueChanged={onCellValueChanged}
            suppressClickEdit={false}
            stopEditingWhenCellsLoseFocus={true}
          />
        </div>
      )}
    </>
  );
};
IngredientTable.propTypes = {
  onDataFetched: PropTypes.func,
};

export default IngredientTable;