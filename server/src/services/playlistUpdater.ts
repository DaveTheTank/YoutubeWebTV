import { Playlist } from '../models/playlist';
import { fetchYouTubePlaylist } from './youtube';

const UPDATE_INTERVAL = 6 * 60 * 60 * 1000; // 6 Stunden

export const updatePlaylists = async () => {
  try {
    const playlists = await Playlist.find({
      lastFetched: { 
        $lt: new Date(Date.now() - UPDATE_INTERVAL) 
      }
    });

    for (const playlist of playlists) {
      const videos = await fetchYouTubePlaylist(playlist.playlistId);
      
      await Playlist.findByIdAndUpdate(playlist._id, {
        videos,
        lastFetched: new Date()
      });
    }
  } catch (error) {
    console.error('Playlist update failed:', error);
  }
};

// Starte den Update-Service
setInterval(updatePlaylists, UPDATE_INTERVAL); 