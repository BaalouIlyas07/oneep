import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './userDashboard.css';

const UserDashboard = () => {
  const [postulations, setPostulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [expandedPostulations, setExpandedPostulations] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchPostulations();
  }, []);

  const fetchPostulations = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:8080/api/appels-offres/postulations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPostulations(data);
        setSuccessMessage('Vos postulations ont été chargées avec succès');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erreur lors du chargement des postulations');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur. Veuillez réessayer plus tard.');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDetails = (postulationId) => {
    setExpandedPostulations(prev => ({
      ...prev,
      [postulationId]: !prev[postulationId]
    }));
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <h2>Mon Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="dashboard-container">
        <div className="postulations-list-container">
          <h3>Mes Postulations</h3>
          
          {postulations.length === 0 ? (
            <p className="no-postulations">Vous n'avez pas encore postulé à des appels d'offres.</p>
          ) : (
            <div className="postulations-list">
              {postulations.map((postulation) => (
                <div key={postulation.id} className="postulation-item">
                  <h4>{postulation.appelOffre.titre}</h4>
                  <p className="postulation-description">{postulation.appelOffre.description}</p>
                  <div className="postulation-details">
                    <div className="postulation-date">
                      Date de postulation: {new Date(postulation.datePostulation).toLocaleDateString()}
                    </div>
                    <div className="postulation-status">
                      Statut: <span className={`status-${postulation.statut.toLowerCase()}`}>
                        {postulation.statut}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="details-toggle-button"
                    onClick={() => toggleDetails(postulation.id)}
                  >
                    {expandedPostulations[postulation.id] ? 'Masquer les détails' : 'Voir les détails'}
                  </button>
                  {expandedPostulations[postulation.id] && (
                    <div className="appel-offre-details">
                      <h5>Détails de l'appel d'offre</h5>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="detail-label">Date limite:</span>
                          <span className="detail-value">{new Date(postulation.appelOffre.dateLimite).toLocaleDateString()}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Montant estimatif:</span>
                          <span className="detail-value">{postulation.appelOffre.montantEstimatif} €</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Site:</span>
                          <span className="detail-value">{postulation.appelOffre.site}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;