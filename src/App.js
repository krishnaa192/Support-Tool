import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Page/Header';
import GraphData from './Page/GraphData';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/graph/:serviceId" element={<GraphData />} />
      </Routes>
    </Router>
  );
}

export default App;
