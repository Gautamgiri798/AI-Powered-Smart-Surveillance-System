import { useState, useEffect } from 'react';

import { Upload, FileVideo, CheckCircle, Download, Loader2, AlertTriangle, Shield, User, Clock, Activity, Cpu, Layers, HardDrive } from 'lucide-react';
import { uploadVideoForAnalysis } from '../services/api';

export default function VideoLab() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, done, error
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);

  // Simulate laboratory progress during deep scans
  useEffect(() => {
    let interval;
    if (status === 'processing') {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95; // Hold at 95% until real response arrives
          return prev + Math.random() * 5; // Realistic variable progress
        });
      }, 1500);
    } else if (status === 'done') {
      setProgress(100);
      clearInterval(interval);
    } else {
      setProgress(0);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrorMessage('');
      setStatus('idle');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('processing');
    try {
      const response = await uploadVideoForAnalysis(file);
      setResult(response.data);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Deep scan failed. Core busy.');
    }
  };

  return (
    <div className="dashboard-container" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="briefing-terminal" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        {/* Lab Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Cpu size={20} color="var(--accent-blue)" style={{ margin: 'auto' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>FORENSIC_INTELLIGENCE_LAB</h2>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>NEURAL_CORE // VERSION_8.4.2</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
             <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.05)' }}>
               SYSTEM_STATUS: {status === 'idle' ? 'STANDBY' : status.toUpperCase()}
             </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 40, position: 'relative' }}>
          {status === 'idle' && (
            <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Process Steps */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 48, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, left: '15%', right: '15%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', zIndex: 0 }}></div>
                
                {[
                  { icon: <HardDrive size={18} />, label: 'ACQUIRE', sub: 'FILE_INGESTION' },
                  { icon: <Activity size={18} />, label: 'ANALYZE', sub: 'NEURAL_MAPPING' },
                  { icon: <Layers size={18} />, label: 'EXPORT', sub: 'FORENSIC_DATA' }
                ].map((step, i) => (
                  <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: i === 0 ? 'var(--accent-blue)' : 'var(--bg-card)', border: `1px solid ${i === 0 ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 0 ? '#fff' : 'var(--text-muted)', boxShadow: i === 0 ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none' }}>
                      {step.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 900, color: i === 0 ? '#fff' : 'var(--text-muted)' }}>{step.label}</div>
                      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600 }}>{step.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Zone */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 650, padding: 48, background: 'rgba(2, 6, 23, 0.3)', border: '2px dashed rgba(255, 255, 255, 0.05)', borderRadius: 24, textAlign: 'center', transition: 'all 0.3s ease' }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.02)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Upload size={32} color="var(--text-muted)" />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 12 }}>INITIATE_SITUATIONAL_SCAN</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                    Select a high-resolution situational telemetry clip (.mp4, .avi) for situational batch neural identification.
                  </p>
                  
                  <label className="mission-action-btn" style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '14px 40px', display: 'inline-flex', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)' }}>
                    <input type="file" accept="video/*" onChange={handleFileChange} style={{ display: 'none' }} />
                    <FileVideo size={16} />
                    {file ? 'CHANGE_MISSION_CLIP' : 'BROWSE_LOCAL_STORAGE'}
                  </label>
                </div>

                {file && (
                  <div className="animate-fade-in" style={{ marginTop: 32, textAlign: 'center' }}>
                    <div style={{ padding: '8px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 12, display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}></div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-green)', letterSpacing: '0.05em' }}>READY: {file.name.toUpperCase()}</span>
                    </div>
                    <br />
                    <button className="btn-engage-elite" style={{ padding: '16px 48px', margin: '0 auto' }} onClick={handleAnalyze}>
                      <Activity size={18} />
                      START_DEEP_NEURAL_SCAN
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 140, height: 140, marginBottom: 40 }}>
                {/* Decorative neural rings */}
                <div style={{ position: 'absolute', top: -10, left: -10, right: -10, bottom: -10, border: '1px dashed rgba(59, 130, 246, 0.2)', borderRadius: '50%', animation: 'spin 10s linear infinite opacity' }}></div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '4px solid rgba(59, 130, 246, 0.05)', borderRadius: '50%' }}></div>
                <Loader2 size={140} className="spin" style={{ color: 'var(--accent-blue)', opacity: 0.8 }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <Cpu size={32} color="var(--accent-blue)" className="pulse" />
                </div>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 16, letterSpacing: '0.05em' }}>ANALYZING_MISSION_TELEMETRY...</h3>
              <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 32, lineHeight: 1.6 }}>
                  The neural core is sampling high-fidelity frames for object classification and behavioral mapping. 
                  Forensic integrity is being verified against mission protocols. 
                  Please wait for situational report generation.
                </p>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-blue)', transition: 'width 1s ease-in-out', boxShadow: '0 0 10px rgba(59, 130, 246, 0.4)' }}></div>
                  <div className="pulse" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: 'scanDiagonal 2s linear infinite' }}></div>
                </div>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>
                    NEURAL_THREADS: [ ACTIVE ] // FRAME_BUFFER: [ OPTIMAL ]
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>
                    {Math.round(progress)}%
                  </div>
                </div>

              </div>
            </div>
          )}


          {status === 'done' && result && (
            <div className="animate-fade-in" style={{ height: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <div style={{ width: 80, height: 80, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <CheckCircle size={40} color="var(--accent-green)" />
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '0.05em' }}>MISSION_SCAN_SUCCESS</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>FORENSIC_REPORT_FINALIZED</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
                {[
                  { icon: <Shield size={22} />, label: 'THREAT_IDENTIFIED', value: result.summary.weapons, color: 'var(--accent-red)' },
                  { icon: <User size={22} />, label: 'SUBJECTS_MAPPED', value: result.summary.persons, color: 'var(--accent-blue)' },
                  { icon: <Clock size={22} />, label: 'TELEMETRY_DUR', value: `${result.duration.toFixed(1)}s`, color: 'var(--text-muted)' }
                ].map((stat, i) => (
                  <div key={i} className="mission-node-card" style={{ padding: '32px 24px', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ color: stat.color, marginBottom: 16 }}>{stat.icon}</div>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>{stat.label}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <button className="mission-action-btn" style={{ flex: 1, padding: '16px 0' }} onClick={() => setStatus('idle')}>
                  RETURN_TO_STAGING
                </button>
                <a href={result.report_url} download className="btn-engage-elite" style={{ flex: 1.5, textDecoration: 'none', justifyContent: 'center', fontSize: '0.75rem' }}>
                  <Download size={18} />
                  DOWNLOAD_FORENSIC_INTEL (.CSV)
                </a>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <AlertTriangle size={40} color="var(--accent-red)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 16, color: 'var(--accent-red)' }}>CRITICAL_SCAN_FAILURE</h3>
              <div style={{ padding: '16px 32px', background: 'rgba(2, 6, 23, 0.4)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', marginBottom: 32 }}>
                 <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>{errorMessage}</p>
              </div>
              <button className="mission-action-btn" style={{ background: 'var(--accent-red)', color: '#fff', border: 'none', padding: '14px 48px' }} onClick={() => setStatus('idle')}>
                RETRY_SCAN_PROTOCOL
              </button>
            </div>
          )}
        </div>
        
        {/* Footer info */}
        <div style={{ padding: '16px 32px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', gap: 24 }}>
            <span>SECURE_LINK: ACTIVE</span>
            <span>ENCRYPTION: AES-256</span>
            <span>DATA_PURGE: AUTOMATED</span>
          </div>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            © 2026 SENTINEL_LABS // GLOBAL_VIGILANCE
          </div>
        </div>
      </div>
    </div>
  );
}

