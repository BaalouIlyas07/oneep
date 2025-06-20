import React, { useState, useEffect } from 'react';
import './serviceDashboard.css'; // Nous allons créer ce fichier CSS

const ServiceDashboard = () => {
  const [postulations, setPostulations] = useState([]);
  const [loadingPostulations, setLoadingPostulations] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedPostulation, setSelectedPostulation] = useState(null);

  // Fonction de navigation simple (si nécessaire pour la déconnexion sur 401)
  const navigate = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    fetchPostulations();
  }, []);

  const fetchPostulations = async () => {
    try {
      setLoadingPostulations(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login'); // Rediriger si pas de token
        return;
      }
      const response = await fetch('http://localhost:8080/api/admin/postulations', { // Note: L'endpoint reste /api/admin/, assurez-vous que le rôle SERVICE y a accès
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPostulations(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec du chargement des postulations');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
      console.error('Erreur fetchPostulations:', err);
    } finally {
      setLoadingPostulations(false);
    }
  };

  const handleUpdatePostulationStatus = async (postulationId, statut) => {
    try {
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/postulations/${postulationId}/statut?statut=${statut}`, { // Endpoint reste /api/admin/
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du statut');
      }

      setPostulations(postulations.map(p =>
        p.id === postulationId ? { ...p, statut } : p
      ));
      setSuccessMessage(`Postulation ${statut.toLowerCase()} avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de la mise à jour du statut');
      console.error('Erreur updatePostulationStatus:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeletePostulation = async (postulationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette postulation ?')) {
      return;
    }
    try {
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/postulations/${postulationId}`, { // Endpoint reste /api/admin/
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression de la postulation');
      }

      setPostulations(postulations.filter(p => p.id !== postulationId));
      setSuccessMessage('Postulation supprimée avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de la suppression de la postulation');
      console.error('Erreur deletePostulation:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'ACCEPTEE': return 'status-accepted';
      case 'REFUSEE': return 'status-rejected';
      case 'EN_ATTENTE': return 'status-pending';
      case 'ANNULEE': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'ACCEPTEE': return 'Acceptée';
      case 'REFUSEE': return 'Refusée';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULEE': return 'Annulée';
      default: return 'En attente';
    }
  };

  const handleViewDetails = (postulation) => {
    setSelectedPostulation(postulation);
  };

  const handleCloseDetails = () => {
    setSelectedPostulation(null);
  };

  return (
    <div className="service-dashboard container">
      <div className="service-header">
        <h2>Tableau de bord Service - Gestion des Postulations</h2>
      </div>

      <div className="messages-container">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError('')}
              aria-label="Fermer"
            />
          </div>
        )}
        {successMessage && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMessage}
            <button
              type="button"
              className="btn-close"
              onClick={() => setSuccessMessage('')}
              aria-label="Fermer"
            />
          </div>
        )}
      </div>

      <div className="postulations-section">
        <div className="section-header">
          <h3>Liste des postulations</h3>
        </div>
        <div className="postulations-list-container">
          {loadingPostulations ? (
            <div className="loading">Chargement des postulations...</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Appel d'offre</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {postulations && postulations.length > 0 ? (
                    postulations.map(postulation => (
                      <tr key={postulation.id}>
                        <td>{postulation.id}</td>
                        <td>{postulation.userName}</td>
                        <td>{postulation.userEmail}</td>
                        <td>
                          {postulation.appelOffreTitre}
                          {postulation.appelOffreNumeroAO && ` (${postulation.appelOffreNumeroAO})`}
                          {postulation.appelOffreSite && ` - ${postulation.appelOffreSite}`}
                        </td>
                        <td>
                          {new Date(postulation.datePostulation).toLocaleDateString('fr-FR')}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(postulation.statut)}`}>
                            {getStatusText(postulation.statut)}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button
                            className="action-btn action-btn-info me-1"
                            onClick={() => handleViewDetails(postulation)}
                          >
                            <i className="bi bi-arrow-right-circle"></i>
                          </button>
                          {postulation.statut === 'EN_ATTENTE' && (
                            <>
                              <button
                                className="action-btn action-btn-success me-1"
                                onClick={() => handleUpdatePostulationStatus(postulation.id, 'ACCEPTEE')}
                              >
                                Accepter
                              </button>
                              <button
                                className="action-btn action-btn-warning me-1"
                                onClick={() => handleUpdatePostulationStatus(postulation.id, 'REFUSEE')}
                              >
                                Rejeter
                              </button>
                            </>
                          )}
                          <button
                            className="action-btn action-btn-danger"
                            onClick={() => handleDeletePostulation(postulation.id)}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        Aucune postulation trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedPostulation && (
        <div className="modal-overlay">
          <div className="details-modal">
            <div className="modal-header">
              <h3>Détails de la postulation</h3>
              <button className="close-button" onClick={handleCloseDetails}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="details-content">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">ID Postulation:</span>
                  <span className="detail-value">{selectedPostulation.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de postulation:</span>
                  <span className="detail-value">
                    {new Date(selectedPostulation.datePostulation).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Statut:</span>
                  <span className={`detail-value status-badge ${getStatusBadgeClass(selectedPostulation.statut)}`}>
                    {getStatusText(selectedPostulation.statut)}
                  </span>
                </div>
              </div>

              <div className="details-section">
                <h4>Informations du postulant</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Nom complet:</span>
                    <span className="detail-value">{selectedPostulation.userName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedPostulation.userEmail}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Informations de l'appel d'offre</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Titre:</span>
                    <span className="detail-value">{selectedPostulation.appelOffreTitre}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Numéro AO:</span>
                    <span className="detail-value">{selectedPostulation.appelOffreNumeroAO || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Site:</span>
                    <span className="detail-value">{selectedPostulation.appelOffreSite || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                {selectedPostulation.statut === 'EN_ATTENTE' && (
                  <>
                    <button
                      className="action-btn action-btn-success me-2"
                      onClick={() => {
                        handleUpdatePostulationStatus(selectedPostulation.id, 'ACCEPTEE');
                        handleCloseDetails();
                      }}
                    >
                      Accepter
                    </button>
                    <button
                      className="action-btn action-btn-warning me-2"
                      onClick={() => {
                        handleUpdatePostulationStatus(selectedPostulation.id, 'REFUSEE');
                        handleCloseDetails();
                      }}
                    >
                      Rejeter
                    </button>
                  </>
                )}
                <button
                  className="action-btn action-btn-danger"
                  onClick={() => {
                    handleDeletePostulation(selectedPostulation.id);
                    handleCloseDetails();
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDashboard;