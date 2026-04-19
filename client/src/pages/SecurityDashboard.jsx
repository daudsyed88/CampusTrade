import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function SecurityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSecurityStatus = async () => {
      try {
        const response = await api.get('/security/status');
        setData(response.data);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError('Access denied. This page is only available to administrator accounts.');
        } else {
          setError('Failed to fetch security telemetry.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-slate-300">Loading security telemetry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-slate-800 p-8 rounded-2xl border border-red-500/30">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8 mt-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <svg className="w-10 h-10 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 1.5a.75.75 0 01.75.75V4.5a.75.75 0 00.75.75h3A2.25 2.25 0 0118.75 7.5v3.18c0 3.738-2.668 6.54-5.632 8.358a1.5 1.5 0 01-1.486 0c-2.964-1.819-5.632-4.62-5.632-8.358V7.5A2.25 2.25 0 018.25 5.25h3a.75.75 0 00.75-.75V2.25A.75.75 0 0112 1.5zM9 10a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" clipRule="evenodd" />
              <path d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
            <h1 className="text-4xl font-bold font-syne tracking-tight">Security Dashboard</h1>
          </div>
          <button 
            onClick={() => navigate('/pentest-report')}
            className="px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded-lg transition-colors border border-blue-500/30 flex items-center gap-2"
          >
            View Pentest Report &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Section 1: Security Controls */}
          <div className="bg-slate-800 rounded-2xl p-6 border-l-4 border-emerald-500 flex flex-col">
            <h2 className="text-xl font-bold mb-4">Active Security Controls ({data.securityControls.length}/{data.securityControls.length})</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ maxHeight: '400px' }}>
              {data.securityControls.map(ctrl => (
                <div key={ctrl.id} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-bold text-slate-200">{ctrl.name}</div>
                    <div className="text-sm text-slate-500">{ctrl.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Stats & Failed Logins */}
          <div className="space-y-8 flex flex-col">
            
            {/* Section 2: Platform Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800 p-4 rounded-2xl text-center">
                <div className="text-3xl font-bold font-syne mb-1">{data.stats.totalUsers}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Users</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl text-center">
                <div className="text-3xl font-bold font-syne mb-1 text-blue-400">{data.stats.totalListings}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Listings</div>
              </div>
              <div className="bg-slate-800 p-4 rounded-2xl text-center border border-slate-700/50">
                <div className={`text-3xl font-bold font-syne mb-1 ${data.stats.failedLoginCount24h > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {data.stats.failedLoginCount24h}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Failed Logins (24h)</div>
              </div>
            </div>

            {/* Section 4: Failed Logins */}
            <div className="bg-slate-800 rounded-2xl p-6 flex-1 flex flex-col min-h-[250px]">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Failed Login Attempts
              </h2>
              
              {data.recentFailedLogins.length === 0 ? (
                <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-lg flex items-center gap-3 border border-emerald-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>No failed login attempts recorded.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700">
                        <th className="pb-2 font-medium">Timestamp</th>
                        <th className="pb-2 font-medium">Email Attempted</th>
                        <th className="pb-2 font-medium">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {data.recentFailedLogins.map(log => (
                        <tr key={log.id} className="bg-red-500/5 hover:bg-red-500/10 transition-colors">
                          <td className="py-2.5 text-slate-300 font-mono text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString('en-GB')}
                          </td>
                          <td className="py-2.5 text-slate-300 truncate max-w-[150px]" title={log.email}>{log.email}</td>
                          <td className="py-2.5 text-slate-400 font-mono text-xs">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          
          {/* Section 3: Recent Audit Log */}
          <div className="bg-slate-800 rounded-2xl p-6 lg:col-span-2">
            <h2 className="text-xl font-bold mb-4">Recent Audit Log</h2>
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-800 backdrop-blur-sm z-10">
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="pb-3 pt-1 font-medium">Timestamp</th>
                    <th className="pb-3 pt-1 font-medium">User</th>
                    <th className="pb-3 pt-1 font-medium">Action</th>
                    <th className="pb-3 pt-1 font-medium">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {data.recentAuditLogs.map(log => {
                    let badgeColor = 'bg-slate-500/20 text-slate-400';
                    if (log.action.includes('CREATE')) badgeColor = 'bg-blue-500/20 text-blue-400';
                    else if (log.action.includes('UPDATE')) badgeColor = 'bg-amber-500/20 text-amber-400';
                    else if (log.action.includes('DELETE')) badgeColor = 'bg-red-500/20 text-red-400';
                    else if (log.action.includes('LOGIN') || log.action.includes('2FA_ENABLED')) badgeColor = 'bg-emerald-500/20 text-emerald-400';
                    else if (log.action.includes('REGISTER')) badgeColor = 'bg-purple-500/20 text-purple-400';

                    return (
                      <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                        <td className="py-3 text-slate-400 font-mono text-xs whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('en-GB')}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="text-slate-300 font-medium">{log.user.displayName}</div>
                          <div className="text-slate-500 text-xs truncate max-w-[150px]">{log.user.email}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${badgeColor}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 text-slate-300 truncate max-w-[200px]" title={log.target}>
                          {log.target}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default SecurityDashboard;
