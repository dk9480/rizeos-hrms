import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';  // Add this import
import Layout from './components/Layout';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />  {/* Add this route */}
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;