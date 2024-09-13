import React from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Page/Header';
import GraphData from './Page/GraphData';
import Login from './Page/Login';
import Admin from './Page/Admin';



function App() {
  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Header />} />
        <Route path="/graph/:serviceId" element={<GraphData />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />

        
      </Routes>
    </Router>
  );
}

export default App;
