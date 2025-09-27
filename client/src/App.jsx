import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element = { < Register />}/>
      </Routes>
    </Router>    
  );
}

export default App;
