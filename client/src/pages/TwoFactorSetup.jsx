import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function TwoFactorSetup() {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch QR code when entering Step 1
    if (step === 1) {
      const fetchSetup = async () => {
        try {
          setIsLoading(true);
          const response = await api.post('/auth/2fa/setup');
          setQrCode(response.data.qrCode);
        } catch (err) {
          setError('Failed to initiate 2FA setup. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };
      
      // If user already has 2FA enabled, probably shouldn't be here, but let's just generate a new one if they insist.
      fetchSetup();
    }
  }, [step]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.post('/auth/2fa/verify-setup', { code });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please check your authenticator app and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 font-syne">2FA Setup</h2>
          <p className="mt-2 text-sm text-slate-600">Secure your account with Google Authenticator</p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
          
          {/* Stepper Header */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-100' : 'bg-slate-100'}`}>
                1
              </div>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-100' : 'bg-slate-100'}`}>
                2
              </div>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-100' : 'bg-slate-100'}`}>
                3
              </div>
            </div>
          </div>

          {error && <div className="mb-4 text-red-500 text-sm text-center font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="text-center space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-900">Scan QR Code</h3>
              
              <div className="flex justify-center border-2 border-dashed border-slate-200 p-4 rounded-xl min-h-[250px] items-center">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                ) : qrCode ? (
                  <img src={qrCode} alt="2FA QR Code" className="w-[200px] h-[200px]" />
                ) : null}
              </div>
              
              <p className="text-sm text-slate-600">
                Open <strong>Google Authenticator</strong> on your phone &rarr; tap the <strong>+</strong> icon &rarr; select <strong>Scan a QR code</strong>
              </p>

              <button
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
                disabled={!qrCode}
                className="w-full py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Next Step
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="text-center space-y-6 animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-900">Verify your app</h3>
              <p className="text-sm text-slate-600">
                Enter the 6-digit code currently shown in your Google Authenticator app to confirm setup.
              </p>

              <form onSubmit={handleVerify} className="space-y-6">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                />

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setCode('');
                      setError(null);
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Enable 2FA'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="text-center space-y-6 animate-fadeIn py-6">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-slate-900">2FA Enabled ✓</h3>
                <p className="mt-2 text-slate-600">Two-factor authentication is now active on your account.</p>
                <p className="mt-1 text-sm text-slate-500">Every login will now require your authenticator code.</p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="w-full mt-4 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
