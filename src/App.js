import React from 'react';

import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Header from './Page/Header';
import GraphData from './Page/GraphData';
import Login from './Page/Login';


const ProtectedRoute = ({ element }) => {
  // Check if the user is logged in
  const sessionData = sessionStorage.getItem("Requested Data");
  let isLoggedIn = false;
  if (sessionData) {
    const data = JSON.parse(sessionData);
    isLoggedIn = data.email ? true : false;
  }
  // If logged in, render the passed component, otherwise redirect to login
  return isLoggedIn ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Protect the header route */}
        <Route path="/" element={<ProtectedRoute element={<Header />} />} />
    
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;