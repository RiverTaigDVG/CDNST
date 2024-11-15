// src/App.tsx
import React from 'react';
import ESRIMap from './ESRIMap';
import '@arcgis/core/assets/esri/themes/light/main.css';

const App: React.FC = () => {
  return (
    <div>
      <ESRIMap />
    </div>
  );
};

export default App;