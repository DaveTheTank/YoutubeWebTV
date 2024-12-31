import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Admin.css';

interface Channel {
  _id: string;
  name: string;
  description: string;
  category: string;
  playlistId: string;
}

const API_BASE_URL = '/api';

const Admin: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [newChannel, setNewChannel] = useState({
    name: '',
    description: '',
    category: '',
    source: '',
    sourceType: 'channel' as 'channel' | 'playlist'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/channels`);
      setChannels(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Kanäle:', error);
      setError('Kanäle konnten nicht geladen werden');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!newChannel.name || !newChannel.description || !newChannel.category || !newChannel.source) {
        setError('Bitte fülle alle Felder aus');
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/channels`, newChannel);
      console.log('Server response:', response.data);
      
      setNewChannel({
        name: '',
        description: '',
        category: '',
        source: '',
        sourceType: 'channel'
      });
      
      fetchChannels();
    } catch (error: any) {
      console.error('Error:', error.response?.data || error);
      setError(error.response?.data?.message || 'Fehler beim Hinzufügen');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Möchtest du diesen Kanal wirklich löschen?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/channels/${id}`);
      fetchChannels();
    } catch (error) {
      setError('Fehler beim Löschen des Kanals');
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="admin-section">
        <h2>Kanäle verwalten</h2>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="channel-form">
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={newChannel.name}
              onChange={e => setNewChannel({...newChannel, name: e.target.value})}
              placeholder="z.B. Nachrichten 24/7"
            />
          </div>

          <div className="form-group">
            <label>Beschreibung:</label>
            <input
              type="text"
              value={newChannel.description}
              onChange={e => setNewChannel({...newChannel, description: e.target.value})}
              placeholder="z.B. Aktuelle Nachrichten rund um die Uhr"
            />
          </div>

          <div className="form-group">
            <label>Kategorie:</label>
            <input
              type="text"
              value={newChannel.category}
              onChange={e => setNewChannel({...newChannel, category: e.target.value})}
              placeholder="z.B. Nachrichten"
            />
          </div>

          <div className="form-group">
            <label>Quelle:</label>
            <div className="source-selector">
              <button
                type="button"
                className={`source-button ${newChannel.sourceType === 'channel' ? 'active' : ''}`}
                onClick={() => setNewChannel({...newChannel, sourceType: 'channel'})}
              >
                YouTube Kanal
              </button>
              <button
                type="button"
                className={`source-button ${newChannel.sourceType === 'playlist' ? 'active' : ''}`}
                onClick={() => setNewChannel({...newChannel, sourceType: 'playlist'})}
              >
                Playlist
              </button>
            </div>
            <input
              type="text"
              value={newChannel.source}
              onChange={e => setNewChannel({...newChannel, source: e.target.value})}
              placeholder={newChannel.sourceType === 'channel' ? 
                "Kanal-Name oder ID (z.B. Tagesschau oder UC5NOEUbkLheQcaaRi1Dq9fg)" : 
                "Playlist-ID (z.B. PLNlI6CU-_dZ6Oc-KxwLqDL9tHR1z9sKlI)"}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Wird hinzugefügt...' : 'Kanal hinzufügen'}
          </button>
        </form>

        <div className="channels-table-container">
          <table className="channels-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Beschreibung</th>
                <th>Kategorie</th>
                <th>Playlist ID</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(channel => (
                <tr key={channel._id}>
                  <td>{channel.name}</td>
                  <td>{channel.description}</td>
                  <td>{channel.category}</td>
                  <td>{channel.playlistId}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(channel._id)}
                      className="delete-button"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin; 