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

  if (loading) return <div className="text-muted">Loading cameras...</div>;

  return (
    <div className="camera-manager">
      <div className="card-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
        <h3><Camera size={18} /> Camera Management</h3>
        <button 
          className={`btn ${showAddForm ? 'btn-ghost' : 'btn-primary'} btn-sm`}
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({ camera_id: '', name: '', location: '', rtsp_url: '', type: 'rtsp' });
          }}
        >
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          {showAddForm ? 'Cancel' : 'Add Camera'}
        </button>
      </div>

      {error && <div className="login-error" style={{ marginBottom: 20 }}>{error}</div>}

      {showAddForm && (
        <div className="card animate-fade-in" style={{ marginBottom: 24, background: 'var(--bg-secondary)' }}>
          <div className="card-body">
            <form onSubmit={handleAddSubmit} className="login-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Camera ID (Unique)</label>
                <input 
                  className="input" 
                  name="camera_id" 
                  value={formData.camera_id} 
                  onChange={handleInputChange} 
                  placeholder="cam_store_01" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Display Name</label>
                <input 
                  className="input" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Front Entrance" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input 
                  className="input" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  placeholder="Building A, Floor 1" 
                />
              </div>
              <div className="form-group">
                <label>Source Type</label>
                <select 
                  className="input" 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange}
                >
                  <option value="rtsp">RTSP Stream</option>
                  <option value="usb">USB / Local Camera</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Source URL / Index</label>
                <input 
                  className="input" 
                  name="rtsp_url" 
                  value={formData.rtsp_url} 
                  onChange={handleInputChange} 
                  placeholder={formData.type === 'usb' ? '0' : 'rtsp://user:pass@ip:port/stream'} 
                  required 
                />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {formData.type === 'usb' 
                    ? 'Use 0 for primary webcam, 1 for secondary.' 
                    : 'Enter the full RTSP or HTTP stream URL.'}
                </p>
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Camera</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="event-log-container" style={{ maxHeight: 'none' }}>
        <table className="event-log-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Location</th>
              <th>Type</th>
              <th>Source</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cameras.map(camera => (
              <tr key={camera.camera_id}>
                <td>
                  <code style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>{camera.camera_id}</code>
                </td>
                <td>
                  {editingId === camera.camera_id ? (
                    <input className="input btn-sm" name="name" value={formData.name} onChange={handleInputChange} />
                  ) : (
                    <span style={{ fontWeight: 600 }}>{camera.name}</span>
                  )}
                </td>
                <td>
                   {editingId === camera.camera_id ? (
                    <input className="input btn-sm" name="location" value={formData.location} onChange={handleInputChange} />
                  ) : (
                    camera.location
                  )}
                </td>
                <td>
                   {editingId === camera.camera_id ? (
                    <select className="input btn-sm" name="type" value={formData.type} onChange={handleInputChange}>
                      <option value="rtsp">RTSP</option>
                      <option value="usb">USB</option>
                    </select>
                  ) : (
                    <span className="badge" style={{ background: camera.type === 'usb' ? 'var(--accent-purple-glow)' : 'var(--accent-primary-glow)', color: camera.type === 'usb' ? 'var(--accent-purple)' : 'var(--accent-primary)' }}>
                      {camera.type === 'usb' ? <Video size={10} /> : <Globe size={10} />}
                      {camera.type}
                    </span>
                  )}
                </td>
                <td>
                   {editingId === camera.camera_id ? (
                    <input className="input btn-sm" name="rtsp_url" value={formData.rtsp_url} onChange={handleInputChange} />
                  ) : (
                    <div style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', opacity: 0.7 }}>
                      {camera.rtsp_url}
                    </div>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    {editingId === camera.camera_id ? (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => handleUpdate(camera.camera_id)}>
                          <Save size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(camera)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--status-inactive)' }} onClick={() => handleDelete(camera.camera_id)}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {cameras.length === 0 && !showAddForm && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No cameras configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
