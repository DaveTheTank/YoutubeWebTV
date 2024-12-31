import axios from 'axios';

export const YOUTUBE_API_KEY = 'AIzaSyD1QQu5Ioz0j68VsswfeLzpPsExQtwYrxk';

// Interface für die Video-Daten
interface Video {
  title: string;
  thumbnail: string;
  videoId: string;
  position: number;
}

// Interface für die YouTube API Playlist-Antwort
interface YouTubePlaylistResponse {
  items?: Array<{
    snippet: {
      title: string;
      thumbnails?: {
        default?: {
          url: string;
        };
      };
      position: number;
    };
    contentDetails: {
      videoId: string;
    };
  }>;
}

// Interface für die YouTube API Playlist-Details-Antwort
interface YouTubePlaylistDetailsResponse {
  items?: Array<{
    id: string;
    snippet: {
      title: string;
    };
  }>;
}

export async function getPlaylistVideos(playlistId: string): Promise<Video[]> {
  try {
    console.log('Fetching playlist videos for:', playlistId);
    
    const response = await axios.get<YouTubePlaylistResponse>(
      'https://www.googleapis.com/youtube/v3/playlistItems',
      {
        params: {
          part: 'snippet,contentDetails',
          playlistId: playlistId,
          maxResults: 50,
          key: YOUTUBE_API_KEY
        }
      }
    );

    if (!response.data.items) {
      console.error('No items in response:', response.data);
      return [];
    }

    return response.data.items.map(item => ({
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url || '',
      videoId: item.contentDetails.videoId,
      position: item.snippet.position
    }));
  } catch (error: any) {
    console.error('Error fetching playlist videos:', {
      playlistId,
      error: error.response?.data || error.message
    });
    throw new Error(`Fehler beim Laden der Videos: ${error.message}`);
  }
}

export async function getChannelVideos(channelId: string): Promise<Video[]> {
  // Für Kanal-Uploads (UU...)
  return getPlaylistVideos(channelId);
}

// Quota-Status-Tracking
let quotaUsed = 0;
const QUOTA_LIMIT = 10000;

export function getQuotaStatus() {
  return {
    used: quotaUsed,
    remaining: QUOTA_LIMIT - quotaUsed,
    limit: QUOTA_LIMIT
  };
}

// Hilfsfunktion zum Validieren einer Playlist
export async function validatePlaylist(playlistId: string): Promise<boolean> {
  try {
    const response = await axios.get<YouTubePlaylistDetailsResponse>(
      'https://www.googleapis.com/youtube/v3/playlists',
      {
        params: {
          part: 'snippet',
          id: playlistId,
          key: YOUTUBE_API_KEY
        }
      }
    );

    return Boolean(response.data.items && response.data.items.length > 0);
  } catch (error) {
    console.error('Playlist validation error:', error);
    return false;
  }
} 