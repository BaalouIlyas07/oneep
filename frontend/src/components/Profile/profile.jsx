import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

const Profile = () => {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    cin: '',
    password: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          cin: data.cin || '',
          password: '',
        });
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        setError('Échec du chargement du profil');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          cin: user.cin,
          password: user.password || undefined // N'envoyer le mot de passe que s'il est modifié
        }),
      });

      if (response.ok) {
        setSuccess('Profil mis à jour avec succès');
        // Réinitialiser le champ mot de passe après une mise à jour réussie
        setUser(prev => ({ ...prev, password: '' }));
        setTimeout(() => setSuccess(null), 3000);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Échec de la mise à jour du profil');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h2>Profil</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={user.firstName}
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
              value={user.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              disabled
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Numéro de téléphone</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cin">CIN</label>
            <input
              type="text"
              id="cin"
              name="cin"
              value={user.cin}
              onChange={handleInputChange}
              disabled={user.cin && user.cin.trim() !== ''}
              placeholder={user.cin && user.cin.trim() !== '' ? "CIN déjà défini" : "Entrez votre CIN"}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe (laisser vide pour conserver l'actuel)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={handleInputChange}
              minLength="6"
            />
          </div>
          
          <button type="submit" className="submit-button">Mettre à jour le profil</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;