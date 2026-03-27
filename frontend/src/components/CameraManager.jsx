import { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Edit2, Save, X, Globe, Video } from 'lucide-react';
import { getCameras, addCamera, updateCamera, deleteCamera } from '../services/api';

export default function CameraManager() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    camera_id: '',
    name: '',
    location: '',
    rtsp_url: '',
    type: 'rtsp'
  });

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const data = await getCameras();
      setCameras(data.cameras || []);
      setError(null);
    } catch (err) {
      setError('Failed to load cameras');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCamera(formData);
      setFormData({ camera_id: '', name: '', location: '', rtsp_url: '', type: 'rtsp' });
      setShowAddForm(false);
      loadCameras();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (camera) => {
    setEditingId(camera.camera_id);
    setFormData({
      camera_id: camera.camera_id,
      name: camera.name,
      location: camera.location,
      rtsp_url: camera.rtsp_url,
      type: camera.type
    });
  };

  const handleUpdate = async (cameraId) => {
    try {
      await updateCamera(cameraId, formData);
      setEditingId(null);
      loadCameras();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (cameraId) => {
    if (!window.confirm(`Are you sure you want to delete camera ${cameraId}?`)) return;
    try {
      await deleteCamera(cameraId);
      loadCameras();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Initializing Node Registry...</div>;

  return (
    <div className="camera-manager">
      <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
          <Camera size={18} color="var(--accent-primary)" /> CAMERA INFRASTRUCTURE
        </h3>
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({ camera_id: '', name: '', location: '', rtsp_url: '', type: 'rtsp' });
          }}
          style={{
            background: showAddForm 
              ? 'rgba(244, 63, 94, 0.08)' 
              : 'rgba(59, 130, 246, 0.08)',
            border: showAddForm
              ? '1px solid rgba(244, 63, 94, 0.25)'
              : '1px solid rgba(59, 130, 246, 0.25)',
            color: showAddForm ? 'var(--accent-red)' : 'var(--accent-primary)',
            padding: '10px 24px',
            borderRadius: '8px',
            fontSize: '0.65rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: showAddForm
              ? '0 0 20px rgba(244, 63, 94, 0.1)'
              : '0 0 20px rgba(59, 130, 246, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
          className="tactical-header-btn"
        >
          <style>{`
            .tactical-header-btn:hover {
              transform: translateY(-1px);
              filter: brightness(1.2);
              box-shadow: 0 0 30px rgba(255,255,255,0.05);
            }
            .tactical-header-btn:active {
              transform: translateY(0);
              scale: 0.98;
            }
          `}</style>

          {showAddForm ? (
            <>
              <X size={14} style={{ strokeWidth: 3 }} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus size={14} style={{ strokeWidth: 3 }} />
              <span>Add New Camera</span>
            </>
          )}
        </button>

      </div>

      {error && <div className="login-error" style={{ margin: '16px 40px' }}>{error}</div>}

      {/* Elite Tactical Add Form */}
      {showAddForm && (
        <div className="animate-fade-in" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'var(--accent-primary)' }}></div>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.1em' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}></span> Node Identifier
              </label>
              <input className="elite-node-input" name="camera_id" value={formData.camera_id} onChange={handleInputChange} placeholder="e.g. cam_04" required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.1em' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}></span> Display Name
              </label>
              <input className="elite-node-input" name="name" value={formData.name} onChange={handleInputChange} placeholder="Forensic Point A" required />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.1em' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}></span> Mission Location
              </label>
              <input className="elite-node-input" name="location" value={formData.location} onChange={handleInputChange} placeholder="Zone Delta" />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.1em' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}></span> Source Protocol
              </label>
              <select className="elite-node-input" name="type" value={formData.type} onChange={handleInputChange}>
                <option value="rtsp" style={{ background: '#0f172a' }}>RTSP Stream</option>
                <option value="usb" style={{ background: '#0f172a' }}>USB Mission Node</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, letterSpacing: '0.1em' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }}></span> Source Telemetry URL
              </label>
              <input className="elite-node-input" style={{ fontFamily: 'var(--font-mono)' }} name="rtsp_url" value={formData.rtsp_url} onChange={handleInputChange} placeholder="rtsp://admin:pass@host:port/stream" required />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="btn-elite-commit" style={{ padding: '12px 30px !important' }}>
                <Save size={14} /> INITIALIZE INFRASTRUCTURE NODE
              </button>
            </div>
          </form>
        </div>
      )}


      <style>{`
        .elite-node-input {
          background: rgba(15, 23, 42, 0.4) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 6px !important;
          padding: 8px 10px !important;
          color: #fff !important;
          font-family: var(--font-main) !important;
          font-size: 0.7rem !important;
          font-weight: 600 !important;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          outline: none;
        }
        .elite-node-input:focus {
          border-color: var(--accent-primary) !important;
          background: rgba(15, 23, 42, 0.6) !important;
        }
        .btn-elite-commit {
          background: rgba(16, 185, 129, 0.1) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          color: var(--accent-green) !important;
          padding: 6px 12px !important;
          border-radius: 6px !important;
          font-weight: 900 !important;
          font-size: 0.6rem !important;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .btn-elite-discard {
          background: rgba(255, 255, 255, 0.02) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: var(--text-muted) !important;
          padding: 6px 12px !important;
          border-radius: 6px !important;
          font-weight: 800 !important;
          font-size: 0.6rem !important;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .action-node-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-node-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: translateY(-1px);
        }
        .action-node-btn.delete:hover {
          background: rgba(244, 63, 94, 0.1);
          border-color: var(--accent-red);
          color: var(--accent-red);
        }
        .editing-row-active {
          background: rgba(59, 130, 246, 0.02) !important;
        }
      `}</style>
      <div style={{ padding: '0 24px', overflowX: 'hidden' }}>
        <table className="event-log-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '12%' }}>ID</th>
              <th style={{ width: '22%' }}>NAME</th>
              <th style={{ width: '22%' }}>LOCATION</th>
              <th style={{ width: '12%' }}>TYPE</th>
              <th style={{ width: '18%' }}>SOURCE</th>
              <th style={{ textAlign: 'right', width: '14%' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map(camera => {
              const isEditing = editingId === camera.camera_id;
              return (
                <tr key={camera.camera_id} className={isEditing ? 'editing-row-active' : ''} style={{ borderLeft: isEditing ? '2px solid var(--accent-primary)' : '2px solid transparent' }}>
                  <td style={{ verticalAlign: 'middle' }}>
                    <code style={{ color: isEditing ? 'var(--accent-primary)' : 'var(--accent-cyan)', fontSize: '0.65rem', fontWeight: 900 }}>{camera.camera_id}</code>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    {isEditing ? (
                      <input 
                        className="elite-node-input" 
                        name="name" value={formData.name} onChange={handleInputChange} 
                      />
                    ) : (
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{camera.name}</span>
                    )}
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    {isEditing ? (
                      <input 
                        className="elite-node-input" 
                        name="location" value={formData.location} onChange={handleInputChange} 
                      />
                    ) : (
                      <span style={{ fontSize: '0.7rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{camera.location}</span>
                    )}
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {camera.type === 'usb' ? <Video size={10} /> : <Globe size={10} />}
                      {camera.type}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', overflow: 'hidden' }}>
                    {isEditing ? (
                      <input 
                        className="elite-node-input" 
                        name="rtsp_url" value={formData.rtsp_url} onChange={handleInputChange} 
                      />
                    ) : (
                      <code style={{ fontSize: '0.6rem', opacity: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                        {camera.rtsp_url}
                      </code>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
                      {isEditing ? (
                        <>
                          <button className="btn-elite-commit" onClick={() => handleUpdate(camera.camera_id)}>
                            <Save size={12} />
                          </button>
                          <button className="btn-elite-discard" onClick={() => setEditingId(null)}>
                            <X size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="action-node-btn" onClick={() => handleEdit(camera)}>
                            <Edit2 size={12} />
                          </button>
                          <button className="action-node-btn delete" onClick={() => handleDelete(camera.camera_id)}>
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>


    </div>
  );
}
