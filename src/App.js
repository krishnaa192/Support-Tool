import React from 'react';

import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Header from './Page/Header';
import GraphData from './Page/GraphData';
import Login from './Page/Login';


const ProtectedRoute = ({ element }) => {
  const isLoggedIn = sessionStorage.getItem('userEmail'); // Check if the user is logged in

  // If logged in, render the passed component, otherwise redirect to login
  return isLoggedIn ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Protect the header route */}
        <Route path="/" element={<ProtectedRoute element={<Header />} />} />
        <Route path="/graph/:serviceId" element={<ProtectedRoute element={<GraphData />} />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;