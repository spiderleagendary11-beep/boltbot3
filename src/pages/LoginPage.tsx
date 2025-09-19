import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from '../components/AuthForm';

export function LoginPage() {
  const { isAuthenticated, login, signup } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tourist Safety</h1>
            <p className="text-gray-600">Your comprehensive safety companion</p>
          </div>

          {/* Authentication Form */}
          <AuthForm onLogin={login} onSignup={signup} />

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our safety protocols and privacy policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}