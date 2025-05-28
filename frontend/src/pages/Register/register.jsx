import { useState } from 'react';
import './register.css';

export default function RegistrationForm() {
  const [accountType, setAccountType] = useState('');
  const [formData, setFormData] = useState({
    // Common fields
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    
    // Individual fields
    cin: '',
    firstName: '',
    lastName: '',
    address: '',
    
    // Company fields
    companyName: '',
    businessName: '',
    tradeRegisterNumber: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const validateForm = () => {
    if (!accountType) {
      setError('Veuillez sélectionner un type de compte.');
      return false;
    }

    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.phoneNumber) {
      setError('Tous les champs communs doivent être remplis.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return false;
    }

    if (accountType === 'INDIVIDUAL') {
      if (!formData.cin || !formData.firstName || !formData.lastName || !formData.address) {
        setError('Tous les champs de la personne physique doivent être remplis.');
        return false;
      }
    } else if (accountType === 'COMPANY') {
      if (!formData.companyName || !formData.businessName || !formData.tradeRegisterNumber) {
        setError('Tous les champs de la personne morale doivent être remplis.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accountType,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP ! Statut: ${response.status}`);
      }

      setSuccess('Inscription réussie ! Redirection vers la page de connexion...');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        cin: '',
        firstName: '',
        lastName: '',
        address: '',
        companyName: '',
        businessName: '',
        tradeRegisterNumber: ''
      });
      setAccountType('');

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur de connexion au serveur. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Inscription</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-group">
          <label>Type de compte</label>
          <div className="account-type-buttons">
            <button
              type="button"
              className={`account-type-button ${accountType === 'INDIVIDUAL' ? 'active' : ''}`}
              onClick={() => setAccountType('INDIVIDUAL')}
            >
              Personne Physique
            </button>
            <button
              type="button"
              className={`account-type-button ${accountType === 'COMPANY' ? 'active' : ''}`}
              onClick={() => setAccountType('COMPANY')}
            >
              Personne Morale
            </button>
          </div>
        </div>

        {accountType === 'INDIVIDUAL' && (
          <>
            <div className="form-group">
              <label htmlFor="cin">CIN</label>
              <input
                type="text"
                id="cin"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                placeholder="Entrez votre CIN"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Entrez votre nom"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Entrez votre prénom"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Adresse</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Entrez votre adresse"
                required
              />
            </div>
          </>
        )}

        {accountType === 'COMPANY' && (
          <>
            <div className="form-group">
              <label htmlFor="companyName">Nom de la société</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Entrez le nom de la société"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessName">Raison sociale</label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Entrez la raison sociale"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tradeRegisterNumber">Numéro de registre du commerce</label>
              <input
                type="text"
                id="tradeRegisterNumber"
                name="tradeRegisterNumber"
                value={formData.tradeRegisterNumber}
                onChange={handleChange}
                placeholder="Entrez le numéro de registre du commerce"
                required
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrez votre email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Numéro de téléphone</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Entrez votre numéro de téléphone"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Entrez votre mot de passe"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe"
            required
          />
        </div>

        <button
          type="submit"
          className="register-button"
          disabled={loading}
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
}
