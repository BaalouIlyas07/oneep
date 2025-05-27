import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './homePage.css';
import ONEEPpImage from '../../imgs/oneep.jpg'; // Importez l'image

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="homepage">
      {/* Section Bannière */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Office National de l'Électricité et de l'Eau Potable</h1>
          <p>Votre partenaire pour l'énergie et l'eau au service du développement durable</p>
          <div className="hero-buttons">
            <Link to="/appels-offres" className="btn btn-primary">Appels d'Offres</Link>
            {!isLoggedIn && (
              <Link to="/register" className="btn btn-secondary">Devenir Fournisseur</Link>
            )}
          </div>
        </div>
      </section>

      {/* Section À Propos */}
      <section className="section about-section">
        <div className="container">
          <h2 className="section-title">À Propos de l'ONEEP</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                L'Office National de l'Électricité et de l'Eau Potable (ONEEP) est un établissement public marocain
                chargé de la production, du transport et de la distribution de l'énergie électrique ainsi que de 
                la gestion des services de l'eau potable et de l'assainissement.
              </p>
              <p>
                Créé suite à la fusion de l'Office National de l'Électricité (ONE) et de l'Office National de l'Eau Potable (ONEP),
                l'ONEEP joue un rôle central dans le développement économique et social du Maroc.
              </p>
              <p>
                Notre mission est de garantir l'accès à l'électricité et à l'eau potable à l'ensemble des citoyens marocains
                tout en contribuant à la transition énergétique et à la préservation des ressources hydriques du pays.
              </p>
            </div>
            <div className="about-image">
              <img src={ONEEPpImage} alt="Siège ONEEP" style={{ width: '100%', height: '300px', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Section Électricité */}
      <section className="section electricity-section">
        <div className="container">
          <h2 className="section-title">Branche Électricité</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Production d'Électricité</h3>
              <p>
                L'ONEEP dispose d'un parc de production diversifié comprenant des centrales thermiques, 
                hydrauliques et des énergies renouvelables (solaire et éolienne).
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔌</div>
              <h3>Transport d'Électricité</h3>
              <p>
                Un réseau de transport électrique couvrant l'ensemble du territoire national, 
                avec des interconnexions avec l'Algérie et l'Espagne.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Distribution d'Électricité</h3>
              <p>
                Distribution de l'électricité dans les zones rurales et certaines villes, 
                avec un taux d'électrification rurale dépassant 99%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Eau Potable */}
      <section className="section water-section">
        <div className="container">
          <h2 className="section-title">Branche Eau Potable</h2>
          <div className="feature-cards">
            <div className="feature-card">
              <div className="feature-icon">💧</div>
              <h3>Production d'Eau Potable</h3>
              <p>
                Captage, traitement et production d'eau potable à partir de ressources 
                souterraines et superficielles.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚰</div>
              <h3>Distribution d'Eau</h3>
              <p>
                Distribution d'eau potable dans plusieurs villes et centres ruraux, 
                assurant l'accès à l'eau à des millions de Marocains.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">♻️</div>
              <h3>Assainissement</h3>
              <p>
                Gestion des services d'assainissement liquide dans plusieurs localités, 
                contribuant à la protection de l'environnement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fournisseurs */}
      <section className="section suppliers-section">
        <div className="container">
          <h2 className="section-title">Espace Fournisseurs</h2>
          <div className="suppliers-content">
            <div className="suppliers-text">
              <p>
                L'ONEEP travaille en étroite collaboration avec un réseau de fournisseurs et prestataires pour mener à bien ses missions. 
                Nous recherchons constamment des partenaires fiables et compétents pour répondre à nos besoins en matière d'équipements, 
                de matériaux et de services.
              </p>
              <p>
                Rejoignez notre réseau de fournisseurs et participez aux appels d'offres pour contribuer aux grands projets 
                d'infrastructure énergétique et hydraulique du Maroc.
              </p>
              <div className="suppliers-buttons">
                <Link to="/appels-offres" className="btn">Consulter les Appels d'Offres</Link>
                {!isLoggedIn && (
                  <Link to="/register" className="btn">Devenir Fournisseur</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Chiffres Clés */}
      <section className="section stats-section">
        <div className="container">
          <h2 className="section-title">Chiffres Clés</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">+99%</div>
              <div className="stat-description">Taux d'électrification rurale</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">+10 000</div>
              <div className="stat-description">Employés dévoués</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">+97%</div>
              <div className="stat-description">Taux d'accès à l'eau potable</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">+40 000</div>
              <div className="stat-description">km de réseau électrique</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;