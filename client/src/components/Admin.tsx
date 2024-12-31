import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Channel {
  _id: string;
  name: string;
  description: string;
  category: string;
  playlistId: string;
}

interface ChannelFormData {
  name: string;
  description: string;
  category: string;
  input: string;
  type: 'channel' | 'playlist';
}

const Admin: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [formData, setFormData] = useState<ChannelFormData>({
    name: '',
    description: '',
    category: '',
    input: '',
    type: 'channel'
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/channels');
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
      if (!formData.name || !formData.description || !formData.category || !formData.input) {
        setError('Bitte fülle alle Felder aus');
        return;
      }

      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        source: formData.input.trim(),
        sourceType: formData.type
      };

      console.log('Sending data:', requestData);

      const response = await axios.post(
        'http://localhost:5001/api/channels',
        requestData
      );

      console.log('Server response:', response.data);
      
      // Formular zurücksetzen
      setFormData({
        name: '',
        description: '',
        category: '',
        input: '',
        type: 'channel'
      });

      // Liste aktualisieren
      loadChannels();

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
      await axios.delete(`http://localhost:5001/api/channels/${id}`);
      loadChannels();
    } catch (error) {
      setError('Fehler beim Löschen des Kanals');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>YouTube WebTV Administration</h1>
      </div>

      <div className="admin-content">
        <section className="add-channel-section">
          <h2>Neuen Kanal hinzufügen</h2>
          
          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="channel-form">
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="z.B. Nachrichten 24/7"
              />
            </div>

            <div className="form-group">
              <label>Beschreibung:</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="z.B. Aktuelle Nachrichten rund um die Uhr"
              />
            </div>

            <div className="form-group">
              <label>Kategorie:</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="z.B. Nachrichten"
              />
            </div>

            <div className="form-group">
              <label>Quelle:</label>
              <div className="source-selector">
                <button
                  type="button"
                  className={`source-button ${formData.type === 'channel' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, type: 'channel'})}
                >
                  YouTube Kanal
                </button>
                <button
                  type="button"
                  className={`source-button ${formData.type === 'playlist' ? 'active' : ''}`}
                  onClick={() => setFormData({...formData, type: 'playlist'})}
                >
                  Playlist
                </button>
              </div>
              <input
                type="text"
                value={formData.input}
                onChange={e => setFormData({...formData, input: e.target.value})}
                placeholder={formData.type === 'channel' ? 
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
        </section>

        <section className="channels-list-section">
          <h2>Vorhandene Kanäle</h2>
          
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
        </section>
      </div>
    </div>
  );
};

export default Admin; 