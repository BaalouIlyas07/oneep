import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login/login.jsx';
import Register from './pages/Register/register.jsx';
import UserDashboard from './pages/UserDashboard/userDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard/adminDashboard.jsx';
import Profile from './components/Profile/profile.jsx';
import HomePage from './pages/HomePage/homePage.jsx';
import Header from './components/Header/header.jsx';
import Footer from './components/Footer/footer.jsx';
import AppelsOffres from './pages/AppelsOffres/appelsOffres.jsx'
import './App.css';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

// Composant Layout qui inclut le Header et le Footer sur toutes les pages
const Layout = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout>
            <Register />
          </Layout>
        } />
        <Route path="/" element={
          <Layout>
            <HomePage />
          </Layout>
        } />
        <Route
          path="/user"
          element={
            <PrivateRoute role="USER">
              <Layout>
                <UserDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route 
          path="/appels-offres" 
            element={
            <Layout>
              <AppelsOffres />
            </Layout>
          }
         />

        <Route
          path="/admin"
          element={
            <PrivateRoute role="ADMIN">
              <Layout>
                <AdminDashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;