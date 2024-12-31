import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import channelRoutes from './routes/channelRoutes';
import authRoutes from './routes/authRoutes';
import { authMiddleware } from './middleware/auth';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Datenbank-Verbindung mit Logging
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tube-tv')
  .then(() => {
    console.log('MongoDB erfolgreich verbunden');
    console.log('Datenbank:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
  })
  .catch((err) => {
    console.error('MongoDB Verbindungsfehler:', err);
  });

// Basis-Route
app.get('/', (req, res) => {
  res.json({ message: 'TubeTV API läuft' });
});

// Routes
app.use('/api/channels', channelRoutes);

app.get('/api/playlist/:id', async (req, res) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${req.params.id}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    
    const items = data.items.map((item: any) => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
      duration: '~', // Dauer müsste separat geholt werden
      position: item.snippet.position
    }));
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Playlist' });
  }
});

app.use('/api/auth', authRoutes);

// Geschützte Routen
// app.post('/api/channels', authMiddleware, channelRoutes);
// app.put('/api/channels/:id', authMiddleware, channelRoutes);
// app.delete('/api/channels/:id', authMiddleware, channelRoutes);

// API-Routen
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
}); 