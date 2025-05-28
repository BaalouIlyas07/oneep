import React, { useEffect, useState, useCallback } from "react"; // Ajout de useCallback
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // useNavigate est conservé au cas où il serait utilisé ailleurs, mais pas pour la redirection ici
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
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    dateLancement: '',
    dateLimite: '',
    montantEstimatif: '',
    site: '',
    numeroAO: ''
  });

  const navigate = useNavigate(); // Conservé, mais la redirection conditionnelle est enlevée de useEffect

  // Nouvelle fonction pour vérifier les postulations de l'utilisateur, encapsulée dans useCallback
  const checkUserApplications = useCallback(async (appels) => {
    try {
      const token = localStorage.getItem('token');
      // Si pas de token (utilisateur non connecté), ne rien faire ou vider les postulations
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
      setUserApplications({}); // En cas d'erreur générale, vider les postulations
    }
  }, []); // setUserApplications est stable, donc pas de dépendance nécessaire ici

  // Encapsulation de fetchAppelsOffres dans useCallback
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
        // Si l'utilisateur n'est pas connecté ou n'est pas 'USER',
        // s'assurer que userApplications est vide.
        setUserApplications({});
      }
    } catch (error) {
      setError("Erreur de chargement des appels d'offres");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [checkUserApplications]); // Dépend de checkUserApplications

  // Vérifier l'authentification et charger les données
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      setUserRole(role);
    } else {
      // Si pas de token/rôle, l'utilisateur n'est pas connecté.
      // userRole reste null (ou est explicitement mis à null).
      setUserRole(null);
    }
    fetchAppelsOffres();
    // La redirection navigate('/login') est supprimée.
    // Les appels d'offres seront affichés même sans connexion.
  }, [fetchAppelsOffres]); // fetchAppelsOffres est maintenant une dépendance


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
    setError(null); // Réinitialiser l'erreur avant la soumission
    try {
      const token = localStorage.getItem('token');
      // Si pas de token, l'utilisateur ne devrait pas pouvoir soumettre (boutons masqués)
      if (!token) {
        setError("Action non autorisée. Veuillez vous connecter.");
        setLoading(false);
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (currentAppel) {
        await axios.put(`http://localhost:8080/api/appels-offres/${currentAppel.id}`, formData, config);
      } else {
        await axios.post('http://localhost:8080/api/appels-offres', formData, config);
      }
      await fetchAppelsOffres(); // Recharger les données
      resetForm();
      setShowAddForm(false);
      setShowEditForm(false);
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
        await axios.delete(`http://localhost:8080/api/appels-offres/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Mettre à jour l'état local après suppression
        setAppelsOffres(prevAppelsOffres => prevAppelsOffres.filter(a => a.id !== id));
        // Alternativement, appeler fetchAppelsOffres() pour recharger depuis le serveur :
        // await fetchAppelsOffres();
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
      await axios.post(
        `http://localhost:8080/api/appels-offres/${id}/postuler`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserApplications(prev => ({ ...prev, [id]: true }));
      alert("Votre candidature a été enregistrée avec succès !");
    } catch (error) {
      setError(error.response?.data?.message || "Erreur lors de la postulation");
      console.error("Erreur postuler:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionButton = (appel) => {
    // Si userRole n'est pas 'USER' (inclut null pour non connecté), ne rien afficher
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

  if (loading && appelsOffres.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }
  if (error && appelsOffres.length === 0) return <div className="error">{error}</div>;

  return (
    <div className="appels-offres-container">
      <div className="headerr">
        <h1>Appels d'Offres</h1>
        {userRole === 'ADMIN' && (
          <button onClick={() => { resetForm(); setCurrentAppel(null); setShowAddForm(true); }} className="btn-add">
            Ajouter un appel d'offre
          </button>
        )}
      </div>

      {error && <div className="error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {loading && appelsOffres.length > 0 && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
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
                {userRole && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appelsOffres.map(appel => (
                <tr key={appel.id}>
                  <td>{appel.site || '-'}</td>
                  <td>{appel.numeroAO || '-'}</td>
                  <td>{appel.titre}</td>
                  <td>{appel.montantEstimatif ? `${appel.montantEstimatif} DH` : '-'}</td>
                  <td>{formatDate(appel.dateLancement)}</td>
                  <td className={isDateExpired(appel.dateLimite) ? 'expired-date-limite' : 'date-limite'}>
                    {formatDate(appel.dateLimite)}
                    {isDateExpired(appel.dateLimite) && <span className="expired-text"> (Expiré)</span>}
                  </td>
                  {userRole && (
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
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(showAddForm || showEditForm) && userRole === 'ADMIN' && (
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