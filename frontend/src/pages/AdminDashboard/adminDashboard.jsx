import React, { useState, useEffect } from 'react';
import './adminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [postulations, setPostulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPostulations, setLoadingPostulations] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
    password: 'password123'
  });
  const [showRoleDropdown, setShowRoleDropdown] = useState(null); // État pour gérer le menu déroulant du rôle

  const navigate = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    fetchUsers();
    fetchPostulations();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec du chargement des utilisateurs');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPostulations = async () => {
    try {
      setLoadingPostulations(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/postulations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPostulations(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec du chargement des postulations');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoadingPostulations(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'USER',
      password: 'password123'
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
   
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      setError('Tous les champs sont obligatoires');
      return;
    }
   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }
   
    setIsSubmitting(true);
    setError('');
   
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(),
          email: newUser.email.trim().toLowerCase(),
          password: newUser.password,
          role: newUser.role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de l\'utilisateur');
      }

      const userData = await response.json();
      setSuccessMessage('Utilisateur ajouté avec succès');
     
      resetForm();
      setShowAddUserForm(false);
     
      setUsers(prevUsers => [...prevUsers, { ...userData, active: true }]);
     
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'ajout de l\'utilisateur');
      console.error('Erreur:', error);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChangeClick = (userId) => {
    setShowRoleDropdown(showRoleDropdown === userId ? null : userId); // Ouvre/ferme le menu pour l'utilisateur
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const user = users.find(u => u.id === userId);
     
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...user,
          role: newRole
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du rôle');
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSuccessMessage('Rôle mis à jour avec succès');
      setShowRoleDropdown(null); // Ferme le menu déroulant après mise à jour
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de la mise à jour du rôle');
      console.error('Erreur:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression de l\'utilisateur');
      }

      setUsers(users.filter(user => user.id !== userId));
      setSuccessMessage('Utilisateur supprimé avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de la suppression de l\'utilisateur');
      console.error('Erreur:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleStatus = async (userId, active) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/status?active=${active}`, {
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

      setUsers(users.map(user =>
        user.id === userId ? { ...user, active } : user
      ));
      setSuccessMessage(`Utilisateur ${active ? 'activé' : 'désactivé'} avec succès`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de la mise à jour du statut');
      console.error('Erreur:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleUpdatePostulationStatus = async (postulationId, statut) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/postulations/${postulationId}/statut?statut=${statut}`, {
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
      console.error('Erreur:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeletePostulation = async (postulationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette postulation ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/postulations/${postulationId}`, {
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
      console.error('Erreur:', error);
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

  return (
    <div className="admin-dashboard container">
      <div className="admin-header">
        <h2>Tableau de bord administrateur</h2>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Gestion des utilisateurs
          </button>
          <button
            className={`tab-button ${activeTab === 'postulations' ? 'active' : ''}`}
            onClick={() => setActiveTab('postulations')}
          >
            Gestion des postulations
          </button>
        </div>
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

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="section-header">
            <h3>Gestion des utilisateurs</h3>
            <button
              className="add-user-button"
              onClick={() => {
                setShowAddUserForm(!showAddUserForm);
                setError('');
                if (!showAddUserForm) {
                  resetForm();
                }
              }}
            >
              {showAddUserForm ? 'Annuler' : 'Ajouter un utilisateur'}
            </button>
          </div>

          {showAddUserForm && (
            <div className="add-user-form-container">
              <h4>Ajouter un nouvel utilisateur</h4>
              <form onSubmit={handleAddUser} className="add-user-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">Prénom</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={newUser.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Nom</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={newUser.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="role">Rôle</label>
                  <select
                    id="role"
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                  >
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                <div className="form-group">
                  <p className="form-text">
                    Le mot de passe par défaut est "password123". L'utilisateur devra le changer à sa première connexion.
                  </p>
                </div>
                <div className="form-group">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="users-list-container">
            {loading ? (
              <div className="loading">Chargement en cours...</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom complet</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users && users.length > 0 ? (
                      users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                              {user.role === 'ADMIN' ? 'Administrateur' : 'Utilisateur'}
                            </span>
                            <div className="role-edit-container">
                              <button
                                className="btn btn-sm btn-primary role-edit-button"
                                onClick={() => handleRoleChangeClick(user.id)}
                              >
                                Modifier
                              </button>
                              {showRoleDropdown === user.id && (
                                <div className="role-dropdown">
                                  <button
                                    className="role-dropdown-item"
                                    onClick={() => handleUpdateUserRole(user.id, 'USER')}
                                  >
                                    Utilisateur
                                  </button>
                                  <button
                                    className="role-dropdown-item"
                                    onClick={() => handleUpdateUserRole(user.id, 'ADMIN')}
                                  >
                                    Administrateur
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}>
                              {user.active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="action-buttons">
                            <button
                              className="btn btn-sm btn-warning me-1"
                              onClick={() => handleToggleStatus(user.id, !user.active)}
                            >
                              {user.active ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">
                          Aucun utilisateur trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'postulations' && (
        <div className="postulations-section">
          <div className="section-header">
            <h3>Gestion des postulations</h3>
          </div>
          <div className="postulations-list-container">
            {loadingPostulations ? (
              <div className="loading">Chargement en cours...</div>
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
                          <td>
                            {postulation.user ?
                              `${postulation.user.firstName} ${postulation.user.lastName}` :
                              'Utilisateur supprimé'
                            }
                          </td>
                          <td>{postulation.emailUser}</td>
                          <td>
                            {postulation.appelOffre ?
                              postulation.appelOffre.titre :
                              'Appel d\'offre supprimé'
                            }
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
                            {postulation.statut === 'EN_ATTENTE' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleUpdatePostulationStatus(postulation.id, 'ACCEPTEE')}
                                >
                                  Accepter
                                </button>
                                <button
                                  className="btn btn-sm btn-warning me-1"
                                  onClick={() => handleUpdatePostulationStatus(postulation.id, 'REFUSEE')}
                                >
                                  Rejeter
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-sm btn-danger"
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
      )}
    </div>
  );
};

export default AdminDashboard;