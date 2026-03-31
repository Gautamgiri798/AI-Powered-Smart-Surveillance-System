import { useState } from 'react';
import { login as loginApi, signup as signupApi, resetPassword as resetApi } from '../services/api';
import { Shield, User, Lock, ArrowRight, UserPlus, LogIn, Key, RotateCcw } from 'lucide-react';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('LOGIN'); // 'LOGIN', 'SIGNUP', 'RESET'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    new_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const data = await loginApi(formData.username, formData.password);
        localStorage.setItem('sentinel_token', data.token);
        localStorage.setItem('sentinel_user', JSON.stringify(data.user));
        onLogin(data.user);
      } else if (mode === 'SIGNUP') {
        await signupApi({
            username: formData.username,
            password: formData.password,
            full_name: formData.full_name
        });
        setSuccess('MISSION_REGISTRATION_COMPLETE // You can now sign in.');
        setMode('LOGIN');
      } else if (mode === 'RESET') {
        await resetApi({
            username: formData.username,
            full_name: formData.full_name,
            new_password: formData.new_password
        });
        setSuccess('MISSION_RECOVERY_SUCCESS // Password updated. Login with new credentials.');
        setMode('LOGIN');
      }
    } catch (err) {
      setError(err.message || 'Mission operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-elite">
      <div className="tactical-backdrop">
        <div className="radar-circle-outer" />
        <div className="radar-circle-inner" />
        <div className="scan-line-v" />
      </div>

      <div className="auth-card-container">
        <div className="auth-card-blur" />
        <div className="auth-card-glow" />
        
        <div className="auth-card">
          <div className="auth-card-header">
            <div className="sentinel-emblem">
              <Shield size={32} color="#fff" strokeWidth={1} />
              <div className="emblem-ping" />
            </div>
            <h1 className="sentinel-title">SENTINEL_VISION</h1>
            <p className="sentinel-subtitle">UNIVERSAL_INTELLIGENCE_INTERFACE</p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${mode === 'LOGIN' ? 'active' : ''}`}
              onClick={() => { setMode('LOGIN'); setError(''); setSuccess(''); }}
            >
              <LogIn size={14} /> SIGN_IN
            </button>
            <button 
              className={`auth-tab ${mode === 'SIGNUP' ? 'active' : ''}`}
              onClick={() => { setMode('SIGNUP'); setError(''); setSuccess(''); }}
            >
              <UserPlus size={14} /> SIGN_UP
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === 'RESET' && (
               <div style={{ marginBottom: 10, textAlign: 'center' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4ade80', letterSpacing: '0.1em' }}>RECOVERY_PROTOCOL_V4.0</h3>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Verify identity matches to calibrate session credentials.</p>
               </div>
            )}

            {error && (
              <div className="auth-error animate-shake">
                <span className="error-code">ERROR //</span> {error}
              </div>
            )}
            
            {success && (
              <div className="auth-success animate-fade-in">
                <span className="success-code">OK //</span> {success}
              </div>
            )}

            {(mode === 'SIGNUP' || mode === 'RESET') && (
              <div className="auth-group">
                <label className="auth-label"><User size={12} /> FULL_NAME_VERIFICATION</label>
                <div className="auth-input-wrapper">
                  <input
                    name="full_name"
                    className="auth-input"
                    type="text"
                    placeholder="Enter registered full name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-group">
              <label className="auth-label"><User size={12} /> OPERATOR_ID</label>
              <div className="auth-input-wrapper">
                <input
                  name="username"
                  className="auth-input"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {mode !== 'RESET' ? (
                <div className="auth-group">
                <label className="auth-label"><Lock size={12} /> SECURITY_KEY</label>
                <div className="auth-input-wrapper">
                    <input
                    name="password"
                    className="auth-input"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    />
                </div>
                </div>
            ) : (
                <div className="auth-group">
                <label className="auth-label"><Key size={12} /> NEW_SECURITY_TOKEN</label>
                <div className="auth-input-wrapper">
                    <input
                    name="new_password"
                    className="auth-input"
                    type="password"
                    placeholder="Set new credentials"
                    value={formData.new_password}
                    onChange={handleInputChange}
                    required
                    />
                </div>
                </div>
            )}

            <button
              className="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{ 
                background: mode === 'RESET' ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' : '', 
                boxShadow: mode === 'RESET' ? '0 10px 30px rgba(74, 222, 128, 0.3)' : ''
              }}
            >
              <span className="btn-label">
                {loading ? 'CALIBRATING...' : 
                 mode === 'LOGIN' ? 'AUTHORIZE_ACCESS' : 
                 mode === 'SIGNUP' ? 'INITIALIZE_ACCOUNT' : 'OVERRIDE_CREDENTIALS'}
              </span>
              {!loading && (mode === 'RESET' ? <RotateCcw size={16} /> : <ArrowRight size={16} className="btn-icon" />)}
            </button>
            
            {mode === 'LOGIN' && (
                <button 
                  type="button" 
                  onClick={() => setMode('RESET')}
                  style={{ background: 'none', border: 'none', color: 'rgba(59, 130, 246, 0.6)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, marginTop: -8, letterSpacing: '0.05em' }}
                >
                    LOST_SECURITY_KEY?
                </button>
            )}

            {mode === 'RESET' && (
                <button 
                  type="button" 
                  onClick={() => setMode('LOGIN')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.3)', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 800, marginTop: -8, letterSpacing: '0.05em' }}
                >
                    RETURN_TO_NORMAL_LOGIN
                </button>
            )}
          </form>

          <div className="auth-footer">
            <div className="security-tag">BIO_METRIC_ENCRYPTION_ACTIVE</div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page-elite {
          width: 100vw;
          height: 100vh;
          background: #020617;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .tactical-backdrop {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .radar-circle-outer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 800px;
          height: 800px;
          border: 1px solid rgba(59, 130, 246, 0.05);
          border-radius: 50%;
        }

        .radar-circle-inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
          border: 1px dashed rgba(59, 130, 246, 0.03);
          border-radius: 50%;
          animation: spin 60s linear infinite;
        }

        .scan-line-v {
          position: absolute;
          top: 0;
          left: 50%;
          width: 1px;
          height: 100%;
          background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.1), transparent);
        }

        .auth-card-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          padding: 20px;
          animation: fadeInScale 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .auth-card-blur {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(40px);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          z-index: -1;
        }

        .auth-card-glow {
          position: absolute;
          inset: -1px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), transparent 40%, transparent 60%, rgba(99, 102, 241, 0.2));
          border-radius: 32px;
          z-index: -2;
          opacity: 0.5;
        }

        .auth-card {
          padding: 48px;
        }

        .auth-card-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .sentinel-emblem {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          position: relative;
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.4);
        }

        .emblem-ping {
          position: absolute;
          inset: -8px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 26px;
          animation: pulse 2s infinite;
        }

        .sentinel-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          color: #fff;
          margin-bottom: 8px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }

        .sentinel-subtitle {
          font-size: 0.6rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
        }

        .auth-tabs {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          padding: 4px;
          border-radius: 14px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .auth-tab {
          flex: 1;
          padding: 12px;
          border: none;
          background: transparent;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .auth-tab.active {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .auth-label {
          font-size: 0.6rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.35);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .auth-input-wrapper {
          position: relative;
        }

        .auth-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 12px 18px;
          color: #fff;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.3s ease;
          outline: none;
        }

        .auth-input:focus {
          background: rgba(30, 41, 59, 0.4);
          border-color: rgba(59, 130, 246, 0.5);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
        }

        .auth-submit-btn {
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-weight: 800;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3);
        }

        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
          filter: brightness(1.1);
        }

        .auth-submit-btn:active {
          transform: translateY(0);
        }

        .auth-error {
          background: rgba(244, 63, 94, 0.1);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #fda4af;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 600;
        }

        .error-code {
          color: #f43f5e;
          font-weight: 900;
        }

        .auth-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.65rem;
          font-weight: 600;
        }

        .success-code {
          color: #10b981;
          font-weight: 900;
        }

        .auth-footer {
          margin-top: 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .security-tag {
          font-size: 0.5rem;
          font-weight: 900;
          letter-spacing: 0.2em;
          color: rgba(59, 130, 246, 0.4);
          text-transform: uppercase;
        }

        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.1; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}
