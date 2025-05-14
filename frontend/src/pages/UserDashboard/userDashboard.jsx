import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './userDashboard.css';

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRequest, setNewRequest] = useState({ title: '', description: '' });
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        setError('Failed to load requests');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRequest({ ...newRequest, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRequest.title || !newRequest.description) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newRequest),
      });

      if (response.ok) {
        setNewRequest({ title: '', description: '' });
        setSuccessMessage('Request submitted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        fetchRequests();
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-dashboard">
      <h2>User Dashboard</h2>
      
      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div className="dashboard-container">
        <div className="request-form-container">
          <h3>Submit New Request</h3>
          <form onSubmit={handleSubmit} className="request-form">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newRequest.title}
                onChange={handleInputChange}
                placeholder="Enter request title"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newRequest.description}
                onChange={handleInputChange}
                placeholder="Describe your request"
                rows="4"
              ></textarea>
            </div>
            
            <button type="submit" className="submit-button">Submit Request</button>
          </form>
        </div>
        
        <div className="requests-list-container">
          <h3>Your Requests</h3>
          
          {requests.length === 0 ? (
            <p className="no-requests">You haven't submitted any requests yet.</p>
          ) : (
            <div className="requests-list">
              {requests.map((request) => (
                <div key={request.id} className="request-item">
                  <h4>{request.title}</h4>
                  <p>{request.description}</p>
                  <div className="request-status">
                    Status: <span className={`status-${request.status.toLowerCase()}`}>{request.status}</span>
                  </div>
                  {request.response && (
                    <div className="request-response">
                      <strong>Response:</strong> {request.response}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;