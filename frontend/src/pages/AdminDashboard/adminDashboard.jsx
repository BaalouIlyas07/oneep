import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Remplacement des toasts par des alertes Bootstrap
import './adminDashboard.css';

const API_BASE_URL = 'http://localhost:8080/api/admin';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER',
    password: 'password123' // Mot de passe par défaut
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/users', {
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
    
    // Vérification des champs requis
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      setError('Tous les champs sont obligatoires');
      return;
    }
    
    // Vérification du format de l'email
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
      
      // Réinitialiser le formulaire et masquer le formulaire
      resetForm();
      setShowAddUserForm(false);
      
      // Mise à jour de la liste des utilisateurs sans recharger toute la page
      setUsers(prevUsers => [...prevUsers, { ...userData, active: true }]);
      
      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'ajout de l\'utilisateur');
      console.error('Erreur:', error);
      // Effacer le message d'erreur après 5 secondes
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/users/${userId}`, {
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
      const response = await fetch(`http://localhost:8080/api/users/${userId}/status?active=${active}`, {
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

  return (
    <div className="admin-dashboard container">
      <div className="admin-actions">
        <h2>Gestion des utilisateurs</h2>
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

      {/* Messages d'erreur et de succès */}
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

      {showAddUserForm && (
        <div className="add-user-form-container">
          <h3>Ajouter un nouvel utilisateur</h3>
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
            <div className="form-row">
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
        <h3>Liste des utilisateurs</h3>
        {loading ? (
          <div className="loading">Chargement en cours...</div>
        ) : (
          <div className="table-responsive">
            <table className="users-table">
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
                        <span className={`role-badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
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
                    <td colSpan="6" className="no-users">
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
  );
};

export default AdminDashboard;