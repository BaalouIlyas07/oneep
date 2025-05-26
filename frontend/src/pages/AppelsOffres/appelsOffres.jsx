import React, { useEffect, useState } from "react";
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
  // Nouvel état pour suivre les postulations
  const [userApplications, setUserApplications] = useState({});
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

  // Vérifier l'authentification et charger les données
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
   
    if (!token) {
      navigate('/login');
      return;
    }
    setUserRole(role);
    fetchAppelsOffres();
  }, [navigate]);

  const fetchAppelsOffres = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/appels-offres');
      setAppelsOffres(response.data);
      
      // Si l'utilisateur est un USER, vérifier ses postulations
      const role = localStorage.getItem('role');
      if (role === 'USER') {
        await checkUserApplications(response.data);
      }
    } catch (error) {
      setError("Erreur de chargement des appels d'offres");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction pour vérifier les postulations de l'utilisateur
  const checkUserApplications = async (appels) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const applications = {};
      
      // Vérifier pour chaque appel d'offre si l'utilisateur a postulé
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
    }
  };

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
   
    try {
      const token = localStorage.getItem('token');
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
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de l'enregistrement");
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
  };

  const supprimerAppelOffre = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet appel d'offre ?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/appels-offres/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppelsOffres(appelsOffres.filter(a => a.id !== id));
      } catch (error) {
        setError("Erreur lors de la suppression");
      }
    }
  };

  const postuler = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/appels-offres/${id}/postuler`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Mettre à jour l'état local pour refléter la postulation
      setUserApplications(prev => ({
        ...prev,
        [id]: true
      }));
      
      alert("Votre candidature a été enregistrée avec succès !");
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la postulation");
    }
  };

  // Fonction pour déterminer le contenu du bouton d'action
  const getActionButton = (appel) => {
    if (userRole !== 'USER') return null;
    
    if (isDateExpired(appel.dateLimite)) {
      return <span className="btn-expired">Expiré</span>;
    }
    
    if (userApplications[appel.id]) {
      return <span className="btn-applied">Déjà postulé</span>;
    }
    
    return (
      <button onClick={() => postuler(appel.id)} className="btn-postuler">
        Postuler
      </button>
    );
  };

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="appels-offres-container">
      <div className="header">
        <h1>Appels d'Offres</h1>
        {userRole === 'ADMIN' && (
          <button onClick={() => { resetForm(); setShowAddForm(true); }} className="btn-add">
            Ajouter un appel d'offre
          </button>
        )}
      </div>

      <div className="appels-list">
        {appelsOffres.length === 0 ? (
          <div className="empty">Aucun appel d'offre disponible</div>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appelsOffres.map(appel => (
                <tr key={appel.id}>
                  <td>{appel.site || '-'}</td>
                  <td>{appel.numeroAO || '-'}</td>
                  <td>{appel.titre}</td>
                  <td>{appel.montantEstimatif ? `${appel.montantEstimatif} €` : '-'}</td>
                  <td className={isDateExpired(appel.dateLancement) ? 'expired' : ''}>
                    {formatDate(appel.dateLancement)}
                  </td>
                  <td className={isDateExpired(appel.dateLimite) ? 'expired' : ''}>
                    {formatDate(appel.dateLimite)}
                    {isDateExpired(appel.dateLimite) && <span> (Expiré)</span>}
                  </td>
                  <td className="actions">
                    {getActionButton(appel)}
                    
                    {userRole === 'ADMIN' && (
                      <>
                        <button onClick={() => modifierAppelOffre(appel)} className="btn-edit">
                          Modifier
                        </button>
                        <button onClick={() => supprimerAppelOffre(appel.id)} className="btn-delete">
                          Supprimer
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(showAddForm || showEditForm) && (
        <div className="modal">
          <div className="modal-content">
            <h2>{currentAppel ? "Modifier l'appel d'offre" : "Ajouter un appel d'offre"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Site *</label>
                <input
                  type="text"
                  name="site"
                  value={formData.site}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>N° AO *</label>
                <input
                  type="text"
                  name="numeroAO"
                  value={formData.numeroAO}
                  onChange={handleInputChange}
                  required
                />
              </div>
             
              <div className="form-group">
                <label>Dénomination (Titre) *</label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Montant Estimatif (€)</label>
                <input
                  type="number"
                  name="montantEstimatif"
                  value={formData.montantEstimatif}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>Date Lancement *</label>
                <input
                  type="date"
                  name="dateLancement"
                  value={formData.dateLancement}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date Limite *</label>
                <input
                  type="date"
                  name="dateLimite"
                  value={formData.dateLimite}
                  onChange={handleInputChange}
                  required
                />
              </div>
             
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {currentAppel ? "Enregistrer" : "Ajouter"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                    setShowEditForm(false);
                  }}
                  className="btn-cancel"
                >
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