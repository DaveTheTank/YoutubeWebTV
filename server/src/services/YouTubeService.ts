import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

class YouTubeService {
  async getChannelVideos(channelId: string, maxResults: number = 50) {
    try {
      // Erst Channel-Uploads-Playlist ID holen
      const channelResponse = await youtube.channels.list({
        part: ['contentDetails'],
        id: [channelId]
      });

      const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error('Uploads playlist nicht gefunden');
      }

      // Videos aus der Uploads-Playlist holen
      const videosResponse = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: uploadsPlaylistId,
        maxResults
      });

      return videosResponse.data.items;
    } catch (error) {
      console.error('Fehler beim Abrufen der Channel-Videos:', error);
      throw error;
    }
  }

  async getPlaylistVideos(playlistId: string, maxResults: number = 50) {
    try {
      const response = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: playlistId,
        maxResults
      });

      return response.data.items;
    } catch (error) {
      console.error('Fehler beim Abrufen der Playlist-Videos:', error);
      throw error;
    }
  }

  async getVideoDetails(videoId: string) {
    try {
      const response = await youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId]
      });

      return response.data.items?.[0];
    } catch (error) {
      console.error('Fehler beim Abrufen der Video-Details:', error);
      throw error;
    }
  }
}

export default new YouTubeService(); 