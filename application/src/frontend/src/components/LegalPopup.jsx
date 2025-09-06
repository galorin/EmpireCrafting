import React from 'react';
import './LegalPopup.css';

const LegalPopup = ({ onAccept }) => {
  return (
    <div className="legal-popup-overlay">
      <div className="legal-popup-content">
        <h2>Welcome to Empire Crafting!</h2>
        <p>
          To enhance your experience, we use local storage to save your inventory data directly on your browser.
          This means your data is stored locally on your device and is not sent to our servers.
        </p>
        <p>
          By clicking "Accept", you consent to the use of local storage for this purpose.
        </p>
        <button onClick={onAccept}>Accept</button>
      </div>
    </div>
  );
};

export default LegalPopup;
