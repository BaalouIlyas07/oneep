import React, { useState, useEffect } from 'react';
import './adminDashboard.css';

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
  // Les états pour le dropdown de rôle ont été supprimés

  // const navigate = (path) => { // window.location.href peut être utilisé directement si pas de react-router-dom navigate
  //   window.location.href = path;
  // };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname === '/admin') {
        setLoading(false);
        setError("Veuillez vous connecter en tant qu'administrateur pour gérer les utilisateurs.");
        // Les actions nécessitant un token échoueront si l'utilisateur n'est pas connecté.
        // La liste des utilisateurs ne se chargera pas.
        return; 
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentification requise pour voir la liste des utilisateurs.");
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setError("Votre session a expiré ou vous n'avez pas les droits. Veuillez vous reconnecter.");
        setUsers([]); 
        // Si vous voulez forcer la déconnexion même sur une page publique :
        // if (window.location.pathname !== '/login') window.location.href = '/login';
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec du chargement des utilisateurs');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
      setUsers([]);
      console.error('Erreur fetchUsers:', err);
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
    const token = localStorage.getItem('token');
    if (!token) {
        setError("Veuillez vous connecter en tant qu'administrateur pour ajouter un utilisateur.");
        return;
    }

    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      setError('Tous les champs sont obligatoires pour ajouter un utilisateur.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setError('Veuillez entrer une adresse email valide.');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      // S'assurer que cet endpoint est sécurisé et prévu pour la création par un admin
      const response = await fetch('http://localhost:8080/api/admin/users/add', { 
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
      
      const createdUser = await response.json(); 
      
      setSuccessMessage('Utilisateur ajouté avec succès.');
      resetForm();
      setShowAddUserForm(false);
      if (createdUser && createdUser.id) {
        // Assurer que `active` a une valeur par défaut si non retourné par l'API
        setUsers(prevUsers => [...prevUsers, { ...createdUser, active: createdUser.active !== undefined ? createdUser.active : true }]);
      } else {
        fetchUsers(); 
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'ajout de l\'utilisateur.');
      console.error('Erreur handleAddUser:', error);
      setTimeout(() => setError(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setError("Veuillez vous connecter en tant qu'administrateur pour supprimer un utilisateur.");
        return;
    }
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    try {
      setError('');
      setSuccessMessage('');
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
      console.error('Erreur deleteUser:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleStatus = async (userId, active) => {
    const token = localStorage.getItem('token');
    if (!token) {
        setError("Veuillez vous connecter en tant qu'administrateur pour modifier le statut.");
        return;
    }
    try {
      setError('');
      setSuccessMessage('');
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
      console.error('Erreur toggleStatus:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const currentToken = localStorage.getItem('token');
  const currentRole = localStorage.getItem('role');
  const isAdmin = currentToken && currentRole === 'ADMIN';

  return (
    <div className="admin-dashboard container">
      <div className="admin-header">
        <h2>Tableau de bord Administrateur</h2>
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
      
      <div className="users-section">
        <div className="section-header">
          <h3>Gestion des utilisateurs</h3>
          {isAdmin && (
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
                {showAddUserForm ? 'Annuler l\'ajout' : 'Ajouter un utilisateur'}
            </button>
          )}
        </div>

        {isAdmin && showAddUserForm && (
          <div className="add-user-form-container">
            <h4>Ajouter un nouvel utilisateur</h4>
            <form onSubmit={handleAddUser} className="add-user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Prénom</label>
                  <input type="text" id="firstName" name="firstName" value={newUser.firstName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Nom</label>
                  <input type="text" id="lastName" name="lastName" value={newUser.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" value={newUser.email} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="role">Rôle</label>
                <select id="role" name="role" value={newUser.role} onChange={handleInputChange}>
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SERVICE">Service</option>
                </select>
              </div>
               <div className="form-group">
                  <label htmlFor="password">Mot de passe</label>
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={newUser.password} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="Minimum 6 caractères"
                  />
                   <p className="form-text">
                     Le mot de passe par défaut suggéré est "password123" si non modifié. L'utilisateur pourra le changer.
                   </p>
                </div>
              <div className="form-group">
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="users-list-container">
          {loading ? (
            <div className="loading">Chargement des utilisateurs...</div>
          ) : users.length > 0 ? ( 
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom complet</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : (user.role === 'SERVICE' ? 'role-service' : 'role-user')}`}>
                          {user.role === 'ADMIN' ? 'Administrateur' : (user.role === 'SERVICE' ? 'Service' : 'Utilisateur')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.active ? 'status-active' : 'status-inactive'}`}>
                          {user.active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      {isAdmin && ( 
                        <td className="action-buttons">
                            <button
                            className="action-btn action-btn-warning me-1"
                            onClick={() => handleToggleStatus(user.id, !user.active)}
                            >
                            {user.active ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                            className="action-btn action-btn-danger"
                            onClick={() => handleDeleteUser(user.id)}
                            >
                            Supprimer
                            </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
             !loading && !error && <div className="no-data">Aucun utilisateur trouvé.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;