import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './userDashboard.css';

const UserDashboard = () => {
  const [postulations, setPostulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPostulations();
  }, []);

  const fetchPostulations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/appels-offres/postulations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPostulations(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        setError('Failed to load postulations');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-dashboard">
      <h2>User Dashboard</h2>
      
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