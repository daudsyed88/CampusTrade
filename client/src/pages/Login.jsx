import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // 2FA states
  const [show2FAScreen, setShow2FAScreen] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [code, setCode] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/2fa/login', { code, tempToken });
      if (res.status === 200) {
        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid authenticator code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', formData);
      if (res.status === 200) {
        if (res.data.requires2FA) {
          setTempToken(res.data.tempToken);
          setShow2FAScreen(true);
          return;
        }

        login(res.data.token, res.data.user);
        navigate('/');
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError("Too many attempts. Please wait 15 minutes.");
      } else {
        setError(err.response?.data?.error || "Invalid email or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        {!show2FAScreen ? (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-syne">
                Welcome Back
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600">
                Log in to your CampusTrade account
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">.edu Email address</label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="student@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                >
                  {isLoading ? 'Logging in...' : 'Sign In'}
                </button>
              </div>
              <div className="text-sm text-center">
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Don't have an account? Sign up
                </Link>
              </div>
            </form>
          </>
        ) : (
          <>
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-syne">
                Two-Factor Authentication
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600">
                Enter the 6-digit code from your Google Authenticator app.
              </p>
            </div>
            
            <form className="mt-8 space-y-6" onSubmit={handle2FASubmit}>
              <div>
                <input
                  name="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  className="appearance-none rounded-md relative block w-full px-3 py-4 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-center text-2xl tracking-widest"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                />
              </div>

              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

              <div>
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading || code.length !== 6 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
              
              <div className="text-sm text-center mt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShow2FAScreen(false);
                    setTempToken(null);
                    setCode('');
                    setError(null);
                  }}
                  className="font-medium text-slate-500 hover:text-slate-700"
                >
                  &larr; Back to login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
