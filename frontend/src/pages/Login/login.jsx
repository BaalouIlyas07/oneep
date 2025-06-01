import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }
    
    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null); // Clear previous server errors
    
    if (validateForm()) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          // credentials: 'include' // 'credentials' might not be needed if using Bearer token
        });

        const data = await response.json();
        
        if (!response.ok) {
          // Prefer message from backend if available and specific
          let errorMessage = 'Erreur lors de la connexion. Vérifiez vos identifiants.';
          if (data && data.message) {
            errorMessage = data.message;
          } else if (response.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect.';
          }
          throw new Error(errorMessage);
        }

        // Stocker le token, le rôle et les informations utilisateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user)); // user object might contain more info
        localStorage.setItem('role', data.user.role); // Storing role separately for easier access
        
        // Rediriger en fonction du rôle
        if (data.user.role === 'ADMIN') {
          navigate('/admin');
        } else if (data.user.role === 'SERVICE') { // <<<--- AJOUT DE CETTE CONDITION
          navigate('/servicedashboard');
        } else if (data.user.role === 'USER') { // Assuming 'USER' is the default non-admin/non-service role
          navigate('/user'); 
        }
         else {
          // Fallback or error if role is unexpected
          console.error('Rôle utilisateur non reconnu:', data.user.role);
          setServerError('Rôle utilisateur non configuré pour la redirection.');
          // navigate('/'); // Or to a default page
        }
      } catch (err) {
        console.error('Erreur de connexion:', err);
        setServerError(err.message || 'Erreur de connexion au serveur. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Connexion</h2>
        {serverError && <div className="error-message server-error-message">{serverError}</div>} {/* Added a specific class for server errors */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: null}); }} // Clear error on change
              className={errors.email ? 'error' : ''}
              autoComplete="email"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if(errors.password) setErrors({...errors, password: null}); }} // Clear error on change
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <button type="submit" className="login-button">Se connecter</button>
        </form>
      </div>
    </div>
  );
};

export default Login;