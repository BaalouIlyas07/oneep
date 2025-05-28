import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3>ONEEP</h3>
          <p>Office National de l'Électricité et de l'Eau Potable</p>
          <p>
            Adresse : Station de Traitement Bouregreg, Ave Mohammed Belhassan El Ouazzani 10000 ,
          </p>
          <p> Rabat  - Maroc</p>
        </div>

        <div className="footer-section">
          <h3>Liens Rapides</h3>
          <ul className="footer-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/appels-offres">Appels d'Offres</Link></li>
            <li><Link to="/login">Connexion</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <p>Téléphone: +212 5 22 66 80 80</p>
          <p>Email: contact@onee.ma</p>
          <div className="social-links">
            <a href="#" className="social-link">Facebook</a>
            <a href="#" className="social-link">Twitter</a>
            <a href="#" className="social-link">LinkedIn</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {currentYear} ONEE - Office National de l'Électricité et de l'Eau Potable. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;