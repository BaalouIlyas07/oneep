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
  const [showRoleDropdown, setShowRoleDropdown] = useState(null); // Pour le dropdown de rôle
  const [dropdownPosition, setDropdownPosition] = useState({});


  const navigate = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 401 || response.status === 403) { // Ajout du 403
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec du chargement des utilisateurs');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur');
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
      const token = localStorage.getItem('token');
      // L'API pour ajouter un utilisateur est généralement /api/auth/register ou similaire,
      // et peut ne pas nécessiter le rôle ADMIN si c'est un endpoint public de création de compte.
      // Si c'est une création par l'admin, l'endpoint pourrait être /api/admin/users
      // Adapter l'URL si nécessaire. Pour l'exemple, on garde /api/auth/register
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${token}`, // Peut être nécessaire ou non selon la config de /register
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(),
          email: newUser.email.trim().toLowerCase(),
          password: newUser.password, // Le backend devrait hasher ça
          role: newUser.role 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'ajout de l\'utilisateur');
      }
      
      // Si l'API register retourne l'utilisateur créé :
      const createdUser = await response.json(); // Supposons que l'API retourne l'utilisateur créé avec son ID
      
      setSuccessMessage('Utilisateur ajouté avec succès.');
      resetForm();
      setShowAddUserForm(false);
      // Mettre à jour la liste des utilisateurs SANS refetch si l'utilisateur créé est retourné
      // Sinon, il faudrait appeler fetchUsers()
      if (createdUser && createdUser.id) {
        setUsers(prevUsers => [...prevUsers, { ...createdUser, active: true }]); // Assumant que l'API retourne l'utilisateur
      } else {
        fetchUsers(); // Fallback si l'utilisateur créé n'est pas retourné
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

  const handleRoleChangeClick = (userId, event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const spaceBelow = windowHeight - rect.bottom;
    const dropdownHeight = 100; 

    setDropdownPosition({
      [userId]: spaceBelow < dropdownHeight ? 'up' : 'down'
    });
    setShowRoleDropdown(showRoleDropdown === userId ? null : userId);
  };
  
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      setError('');
      setSuccessMessage('');
      const token = localStorage.getItem('token');
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) {
        throw new Error("Utilisateur non trouvé pour la mise à jour.");
      }

      // L'API PUT sur /api/admin/users/{id} devrait prendre tout l'objet utilisateur ou juste les champs à modifier.
      // Ici, on envoie un objet avec le rôle mis à jour.
      // Assurez-vous que votre backend s'attend à cela.
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, { // Supposons un endpoint dédié pour le rôle
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole }) // Envoyez uniquement le rôle, ou l'objet User complet si nécessaire
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour du rôle');
      }

      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setSuccessMessage('Rôle mis à jour avec succès');
      setShowRoleDropdown(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setError(error.message || 'Erreur lors de la mise à jour du rôle');
      console.error('Erreur updateUserRole:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    try {
      setError('');
      setSuccessMessage('');
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
      console.error('Erreur deleteUser:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleToggleStatus = async (userId, active) => {
    try {
      setError('');
      setSuccessMessage('');
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
      console.error('Erreur toggleStatus:', error);
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <div className="admin-dashboard container">
      <div className="admin-header">
        <h2>Tableau de bord Administrateur</h2>
        {/* La navigation par onglets n'est plus nécessaire s'il ne reste que la gestion des utilisateurs */}
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

      {/* Section Utilisateurs toujours visible */}
      <div className="users-section">
        <div className="section-header">
          <h3>Gestion des utilisateurs</h3>
          <button
            className="add-user-button"
            onClick={() => {
              setShowAddUserForm(!showAddUserForm);
              setError(''); // Clear error when toggling form
              if (!showAddUserForm) { // If opening form
                resetForm();
              }
            }}
          >
            {showAddUserForm ? 'Annuler l\'ajout' : 'Ajouter un utilisateur'}
          </button>
        </div>

        {showAddUserForm && (
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
                  <option value="SERVICE">Service</option> {/* Ajout du rôle SERVICE */}
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
                          <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : (user.role === 'SERVICE' ? 'role-service' : 'role-user')}`}>
                            {user.role === 'ADMIN' ? 'Administrateur' : (user.role === 'SERVICE' ? 'Service' : 'Utilisateur')}
                          </span>
                          <div className="role-edit-container">
                            <button className="role-edit-button" onClick={(e) => handleRoleChangeClick(user.id, e)}>
                              Modifier
                            </button>
                            {showRoleDropdown === user.id && (
                              <div className={`role-dropdown ${dropdownPosition[user.id] === 'up' ? 'dropup' : ''}`}>
                                <button className="role-dropdown-item" data-role="USER" onClick={() => handleUpdateUserRole(user.id, 'USER')}>Utilisateur</button>
                                <button className="role-dropdown-item" data-role="ADMIN" onClick={() => handleUpdateUserRole(user.id, 'ADMIN')}>Administrateur</button>
                                <button className="role-dropdown-item" data-role="SERVICE" onClick={() => handleUpdateUserRole(user.id, 'SERVICE')}>Service</button>
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">Aucun utilisateur trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;