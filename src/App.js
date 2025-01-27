import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import HelpsCard from "./pages/HelpsCard";
import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Detail from "./pages/Detail";
import './App.css'

function App() {
  return (
    <Router> 
      <div className="app-container">
        <Header />
        <Sidebar />
        <div className="main-container">
          
          <div className="content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/HelpsCard" element={<HelpsCard />} />
              <Route path="/Detail/:id" element={<Detail />}/> 
            </Routes>
          </div>
        </div>
      </div>
    </Router> 
  );
}

export default App;
