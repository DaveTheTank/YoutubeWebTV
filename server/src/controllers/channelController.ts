import { Request, Response } from 'express';
import { Channel } from '../models/Channel';
import axios from 'axios';
import { YOUTUBE_API_KEY } from '../utils/youtubeApi';

// Interface für die Channel API Antwort
interface YouTubeChannelResponse {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
}

// Interface für die Search API Antwort
interface YouTubeSearchResponse {
  items?: Array<{
    id?: {
      channelId?: string;
    };
  }>;
}

// Interface für die PlaylistItems API Antwort
interface YouTubePlaylistResponse {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
    };
  }>;
}

// Interface für die PlaylistItems API Antwort
interface YouTubePlaylistItemsResponse {
  items: Array<{
    snippet: {
      title: string;
      resourceId: {
        videoId: string;
      };
      thumbnails: {
        default: {
          url: string;
        };
      };
    };
  }>;
}

export const channelController = {
  createChannel: async (req: Request, res: Response) => {
    try {
      console.log('Raw request body:', req.body);
      
      let { name, description, category, source, sourceType } = req.body;
      let playlistId: string;

      try {
        if (sourceType === 'channel') {
          // Prüfe ob es eine Channel-ID ist
          if (source.startsWith('UC')) {
            console.log('Verarbeite Channel-ID:', source);
            const channelId = source;
            
            const response = await axios.get<YouTubeChannelResponse>(
              'https://www.googleapis.com/youtube/v3/channels',
              {
                params: {
                  part: 'contentDetails',
                  id: channelId,
                  key: YOUTUBE_API_KEY
                }
              }
            );

            console.log('Channel API Antwort:', response.data);

            if (!response.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
              throw new Error('Keine Upload-Playlist gefunden');
            }

            playlistId = response.data.items[0].contentDetails.relatedPlaylists.uploads;
          } else {
            // Es ist ein Kanalname
            console.log('Suche Kanal:', source);
            const searchResponse = await axios.get<YouTubeSearchResponse>(
              'https://www.googleapis.com/youtube/v3/search',
              {
                params: {
                  part: 'id',
                  type: 'channel',
                  q: source,
                  maxResults: 1,
                  key: YOUTUBE_API_KEY
                }
              }
            );

            console.log('Search API Antwort:', searchResponse.data);

            if (!searchResponse.data.items?.[0]?.id?.channelId) {
              throw new Error('Kanal nicht gefunden');
            }

            const channelId = searchResponse.data.items[0].id.channelId;
            console.log('Gefundene Channel-ID:', channelId);

            // Hole die Upload-Playlist
            const channelResponse = await axios.get<YouTubeChannelResponse>(
              'https://www.googleapis.com/youtube/v3/channels',
              {
                params: {
                  part: 'contentDetails',
                  id: channelId,
                  key: YOUTUBE_API_KEY
                }
              }
            );

            if (!channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads) {
              throw new Error('Keine Upload-Playlist gefunden');
            }

            playlistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
          }
        } else {
          // Es ist eine direkte Playlist-ID
          playlistId = source;
        }

        console.log('Finale Playlist-ID:', playlistId);

      } catch (error: any) {
        console.error('YouTube API Fehler:', error);
        throw new Error(`Fehler bei der YouTube API: ${error.message}`);
      }

      const newChannel = new Channel({
        name,
        description,
        category,
        playlistId
      });

      const savedChannel = await newChannel.save();
      console.log('Channel erfolgreich gespeichert:', savedChannel);
      
      res.status(201).json(savedChannel);
    } catch (error: any) {
      console.error('Fehler beim Erstellen des Channels:', error);
      res.status(500).json({ 
        message: 'Fehler beim Erstellen des Channels',
        error: error.message 
      });
    }
  },

  deleteChannel: async (req: Request, res: Response) => {
    try {
      const channelId = req.params.id;
      const deletedChannel = await Channel.findByIdAndDelete(channelId);
      
      if (!deletedChannel) {
        return res.status(404).json({ message: 'Channel nicht gefunden' });
      }
      
      res.json({ message: 'Channel erfolgreich gelöscht' });
    } catch (error) {
      console.error('Error deleting channel:', error);
      res.status(500).json({ message: 'Fehler beim Löschen des Channels' });
    }
  },

  getChannels: async (_req: Request, res: Response) => {
    try {
      const channels = await Channel.find();
      res.json(channels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      res.status(500).json({ message: 'Fehler beim Abrufen der Channels' });
    }
  },

  getPlaylistVideos: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'Playlist ID ist erforderlich' });
      }

      const response = await axios.get<YouTubePlaylistItemsResponse>(
        'https://www.googleapis.com/youtube/v3/playlistItems',
        {
          params: {
            part: 'snippet',
            maxResults: 50,
            playlistId: id,
            key: YOUTUBE_API_KEY
          }
        }
      );

      const videos = response.data.items.map(item => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails.default.url
      }));

      res.json(videos);
    } catch (error: any) {
      console.error('Fehler beim Laden der Playlist:', error.response?.data || error);
      res.status(400).json({ 
        message: 'Fehler beim Laden der Playlist',
        error: error.response?.data?.error?.message || error.message
      });
    }
  }
}; 