import React, { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './appelsOffres.css';

const AppelsOffres = () => {
  const [appelsOffres, setAppelsOffres] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentAppel, setCurrentAppel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userApplications, setUserApplications] = useState({});
  const [selectedAppel, setSelectedAppel] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateLancement: '',
    dateLimite: '',
    montantEstimatif: '',
    site: '',
    numeroAO: ''
  });

  const navigate = useNavigate();

  const checkUserApplications = useCallback(async (appels) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserApplications({});
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const applications = {};
      for (const appel of appels) {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/appels-offres/${appel.id}/has-applied`,
            config
          );
          applications[appel.id] = response.data;
        } catch (error) {
          console.error(`Erreur lors de la vérification pour l'appel ${appel.id}:`, error);
          applications[appel.id] = false;
        }
      }
      setUserApplications(applications);
    } catch (error) {
      console.error('Erreur lors de la vérification des postulations:', error);
      setUserApplications({});
    }
  }, []);

  const fetchAppelsOffres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/appels-offres');
      setAppelsOffres(response.data);

      const token = localStorage.getItem('token');
      const roleFromStorage = localStorage.getItem('role');

      if (token && roleFromStorage === 'USER') {
        await checkUserApplications(response.data);
      } else {
        setUserApplications({});
      }
    } catch (error) {
      setError("Erreur de chargement des appels d'offres");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [checkUserApplications]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      setUserRole(role);
    } else {
      setUserRole(null);
    }
    fetchAppelsOffres();
  }, [fetchAppelsOffres]);


  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const isDateExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      dateLancement: '',
      dateLimite: '',
      montantEstimatif: '',
      site: '',
      numeroAO: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Action non autorisée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }
      // Assurez-vous que l'utilisateur a le rôle SERVICE pour ces actions
      if (userRole !== 'SERVICE') {
        setError("Action non autorisée pour votre rôle.");
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (currentAppel) {
        await axios.put(`http://localhost:8080/api/appels-offres/${currentAppel.id}`, formData, config);
      } else {
        await axios.post('http://localhost:8080/api/appels-offres', formData, config);
      }
      await fetchAppelsOffres();
      resetForm();
      setShowAddForm(false);
      setShowEditForm(false);
      setCurrentAppel(null);
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de l'enregistrement");
      console.error("Erreur handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  const modifierAppelOffre = (appel) => {
    setCurrentAppel(appel);
    setFormData({
      titre: appel.titre,
      description: appel.description,
      dateLancement: appel.dateLancement || '',
      dateLimite: appel.dateLimite || '',
      montantEstimatif: appel.montantEstimatif || '',
      site: appel.site || '',
      numeroAO: appel.numeroAO || ''
    });
    setShowEditForm(true);
    setShowAddForm(false); // S'assurer que le formulaire d'ajout est fermé
  };

  const supprimerAppelOffre = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet appel d'offre ?")) {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Action non autorisée. Veuillez vous connecter.");
          setLoading(false);
          return;
        }
        // Assurez-vous que l'utilisateur a le rôle SERVICE pour ces actions
        if (userRole !== 'SERVICE') {
            setError("Action non autorisée pour votre rôle.");
            setLoading(false);
            return;
        }
        await axios.delete(`http://localhost:8080/api/appels-offres/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppelsOffres(prevAppelsOffres => prevAppelsOffres.filter(a => a.id !== id));
      } catch (error) {
        setError(error.response?.data?.message || "Erreur lors de la suppression");
        console.error("Erreur supprimerAppelOffre:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const postuler = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Action non autorisée. Veuillez vous connecter pour postuler.");
        setLoading(false);
        return;
      }
      if (userRole !== 'USER') {
        setError("Seuls les utilisateurs peuvent postuler.");
        setLoading(false);
        return;
      }
      await axios.post(
        `http://localhost:8080/api/appels-offres/${id}/postuler`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserApplications(prev => ({ ...prev, [id]: true }));
      alert("Votre candidature a été enregistrée avec succès !");
      handleCloseDetails(); // Fermer la modal après une postulation réussie
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Erreur lors de la postulation");
      console.error("Erreur postuler:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appel) => {
    setSelectedAppel(appel);
  };

  const handleCloseDetails = () => {
    setSelectedAppel(null);
  };

  const getActionButton = (appel) => {
    if (userRole !== 'USER') return null;

    if (isDateExpired(appel.dateLimite)) {
      return <span className="btn-expired">Expiré</span>;
    }
    if (userApplications[appel.id]) {
      return (
        <div className="applied-actions">
          <span className="btn-applied">Déjà postulé</span>
          <button onClick={() => handleViewDetails(appel)} className="btn-view-details-arrow">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      );
    }
    return (
      <button onClick={() => handleViewDetails(appel)} className="btn-view-details">
        Voir détails
      </button>
    );
  };

  if (loading && appelsOffres.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }
  // Affiche l'erreur seulement si la liste est vide, sinon l'erreur s'affiche au-dessus de la liste.
  if (error && appelsOffres.length === 0 && !loading) return <div className="error">{error}</div>;

  return (
    <div className="appels-offres-container">
      <div className="headerr">
        <h1>Appels d'Offres</h1>
        {/* MODIFIÉ ICI: userRole === 'SERVICE' au lieu de 'ADMIN' */}
        {userRole === 'SERVICE' && (
          <button onClick={() => { resetForm(); setCurrentAppel(null); setShowAddForm(true); setShowEditForm(false);}} className="btn-add">
            Ajouter un appel d'offre
          </button>
        )}
      </div>

      {error && <div className="error-message-inline" style={{ marginBottom: '1rem', color: 'red', textAlign:'center' }}>{error}</div>}
      {loading && appelsOffres.length > 0 && ( // Afficher le spinner de chargement même si des données sont déjà là
        <div className="loading-indicator-inline">Chargement en cours...</div>
      )}

      <div className="appels-list">
        {appelsOffres.length === 0 && !loading ? (
          <div className="empty">Aucun appel d'offre disponible pour le moment.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>N° AO</th>
                <th>Dénomination</th>
                <th>Montant Estimatif</th>
                <th>Date Lancement</th>
                <th>Date Limite</th>
                {/* La colonne Actions ne s'affiche que si un utilisateur est connecté (USER ou SERVICE) */}
                {userRole && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appelsOffres.map(appel => (
                <tr key={appel.id}>
                  <td>{appel.site || '-'}</td>
                  <td>{appel.numeroAO || '-'}</td>
                  <td>{appel.titre}</td>
                  <td>{appel.montantEstimatif ? `${Number(appel.montantEstimatif).toLocaleString('fr-MA')} DH` : '-'}</td>
                  <td>{formatDate(appel.dateLancement)}</td>
                  <td className={isDateExpired(appel.dateLimite) ? 'expired-date-limite' : 'date-limite'}>
                    {formatDate(appel.dateLimite)}
                    {isDateExpired(appel.dateLimite) && <span className="expired-text"> (Expiré)</span>}
                  </td>
                  {/* La colonne Actions ne s'affiche que si un utilisateur est connecté */}
                  {userRole && (
                    <td className="actions">
                      {/* Bouton Postuler pour USER */}
                      {getActionButton(appel)}

                      {/* Boutons Modifier/Supprimer pour SERVICE */}
                      {/* MODIFIÉ ICI: userRole === 'SERVICE' au lieu de 'ADMIN' */}
                      {userRole === 'SERVICE' && (
                        <>
                          <button onClick={() => modifierAppelOffre(appel)} className="btn-edit" disabled={loading}>
                            Modifier
                          </button>
                          <button onClick={() => supprimerAppelOffre(appel.id)} className="btn-delete" disabled={loading}>
                            Supprimer
                          </button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal pour les détails de l'appel d'offre */}
      {selectedAppel && (
        <div className="modal">
          <div className="modal-content details-modal">
            <div className="modal-header">
              <h2>Détails de l'appel d'offre</h2>
              <button onClick={handleCloseDetails} className="close-button">&times;</button>
            </div>
            <div className="details-content">
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Site:</span>
                  <span className="detail-value">{selectedAppel.site || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">N° AO:</span>
                  <span className="detail-value">{selectedAppel.numeroAO || '-'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Dénomination:</span>
                  <span className="detail-value">{selectedAppel.titre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Montant Estimatif:</span>
                  <span className="detail-value">
                    {selectedAppel.montantEstimatif ? `${Number(selectedAppel.montantEstimatif).toLocaleString('fr-MA')} DH` : '-'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date de Lancement:</span>
                  <span className="detail-value">{formatDate(selectedAppel.dateLancement)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date Limite:</span>
                  <span className="detail-value">{formatDate(selectedAppel.dateLimite)}</span>
                </div>
              </div>
              <div className="description-section">
                <h3>Description</h3>
                <p className="description-text">{selectedAppel.description || 'Aucune description disponible.'}</p>
              </div>
              {userRole === 'USER' && !isDateExpired(selectedAppel.dateLimite) && !userApplications[selectedAppel.id] && (
                <div className="postulation-action">
                  <button onClick={() => postuler(selectedAppel.id)} className="btn-postuler" disabled={loading}>
                    {loading ? 'En cours...' : 'Postuler'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal pour Ajouter/Modifier, s'affiche seulement si userRole est SERVICE */}
      {/* MODIFIÉ ICI: userRole === 'SERVICE' au lieu de 'ADMIN' */}
      {(showAddForm || showEditForm) && userRole === 'SERVICE' && (
        <div className="modal">
          <div className="modal-content">
            <h2>{currentAppel ? "Modifier l'appel d'offre" : "Ajouter un appel d'offre"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Site *</label>
                <input type="text" name="site" value={formData.site} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>N° AO *</label>
                <input type="text" name="numeroAO" value={formData.numeroAO} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Dénomination (Titre) *</label>
                <input type="text" name="titre" value={formData.titre} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
              </div>
              <div className="form-group">
                <label>Montant Estimatif (DH)</label>
                <input type="number" name="montantEstimatif" value={formData.montantEstimatif} onChange={handleInputChange} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label>Date Lancement *</label>
                <input type="date" name="dateLancement" value={formData.dateLancement} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Date Limite *</label>
                <input type="date" name="dateLimite" value={formData.dateLimite} onChange={handleInputChange} required />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : (currentAppel ? "Enregistrer" : "Ajouter")}
                </button>
                <button type="button" onClick={() => { resetForm(); setShowAddForm(false); setShowEditForm(false); setCurrentAppel(null); setError(null); }} className="btn-cancel" disabled={loading}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppelsOffres;