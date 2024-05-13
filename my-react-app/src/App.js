// App.js
import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from './components/AuthContext';
import SignOutButton from './components/SignOut';
import HomePage from './components/HomePage';
import Login from './components/Login';
import SignUp from './components/SignUp';
import AddStock from './components/AddStock';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import './App.css';
import Advice from "./components/Advice";
import BusinessNews from './components/NewsPage';


function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <header className="header">
          <div className="container d-flex justify-content-between align-items-center">
            <h1 className="logo text-white">
              <Link to="/" className="text-white text-decoration-none">
                <img src={require('./images/treasure_chest.png')} alt="" style={{ width: '40px', height: '40px' }}/>
                TradeTrove
              </Link>            
            </h1>
            <Navbar />
            <div>
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/addstock" element={<AddStock />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/advice" element={<Advice />} />
            <Route path="/businessnews" element={<BusinessNews />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            &copy; 2024 TradeTrove. All Rights Reserved.
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

export default App;