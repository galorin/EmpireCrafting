// src/components/IngredientTable.jsx
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

const IngredientTable = ({ ingredients, onDataFetched }) => {
  const onCellValueChanged = useCallback((params) => {
    const { data } = params;
    const updatedRowData = ingredients.map(row => (row.Id === data.Id ? data : row));
    localStorage.setItem('ingredients', JSON.stringify(updatedRowData));
    if (onDataFetched) {
      onDataFetched(updatedRowData);
    }
  }, [ingredients, onDataFetched]);

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
      <div className="ingredient-table-container ag-theme-alpine">
        <AgGridReact
          rowData={ingredients}
          columnDefs={columns}
          defaultColDef={{ resizable: true }}
          onCellValueChanged={onCellValueChanged}
          suppressClickEdit={false}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </>
  );
};

IngredientTable.propTypes = {
  ingredients: PropTypes.array.isRequired,
  onDataFetched: PropTypes.func,
};

export default IngredientTable;