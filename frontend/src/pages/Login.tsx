// frontend/src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { LoadingSpinnerInline } from '../components/LoadingSpinner';

export function Login() {
  const [credential, setCredential] = useState(''); // Can be Name or ID
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call the NEW public auth route
      const response = await apiClient.post('/auth/login', {
        // Simple check: if it looks like a UUID, treat as ID, else Name
        id: credential.includes('-') ? credential : undefined,
        name: !credential.includes('-') ? credential : undefined
      });

      if (response.data.success) {
        // 1. Save Staff ID to LocalStorage
        localStorage.setItem('staffId', response.data.data.id);
        
        // 2. Redirect to Dashboard
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your ID/Name.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">IMS Healthcare</h1>
          <p className="text-gray-600 mt-2">Staff Portal Login</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Staff ID or Name
            </label>
            <input
              type="text"
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="e.g., Admin User"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex justify-center items-center py-2.5"
          >
            {loading ? <LoadingSpinnerInline /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
