import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './header.css';
import oneepLogo from '../../imgs/logo.jpg'; // Importez l'image

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(!!token);
    setUserRole(role || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    navigate('/');
    window.location.reload(); // Rafraîchir pour mettre à jour l'interface
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo-container">
          <Link to="/" className="logo">
            <img src={oneepLogo} alt="ONEE Logo" />
          </Link>
          <div className="logo-text">
            <Link to="/" className="logo">
            <h1>ONEEP </h1>
          </Link>
            <p>Office National de l'Électricité et de l'Eau Potable</p>
          </div>
        </div>

        <button className="menu-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Accueil</Link></li>
            <li><Link to="/appels-offres" onClick={() => setIsMenuOpen(false)}>Appels d'Offres</Link></li>
            <li><Link to="/devenir-fournisseur" onClick={() => setIsMenuOpen(false)}>Devenir Fournisseur</Link></li>
          </ul>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="btn btn-profile" onClick={() => setIsMenuOpen(false)}>
                  Mon Profil
                </Link>
                <button className="btn btn-logout" onClick={handleLogout}>
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-login" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
                <Link to="/register" className="btn btn-register" onClick={() => setIsMenuOpen(false)}>Inscription</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;