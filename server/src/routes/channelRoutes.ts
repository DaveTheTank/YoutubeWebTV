import express from 'express';
import { channelController } from '../controllers/channelController';
import { google } from 'googleapis';
import { youtube_v3 } from 'googleapis';
import { GaxiosError } from 'googleapis-common';
import axios from 'axios';
import * as xml2js from 'xml2js';

const router = express.Router();

router.get('/', channelController.getChannels);
router.post('/', channelController.createChannel);
router.delete('/:id', channelController.deleteChannel);

router.get('/playlist/:playlistId', async (req, res) => {
  try {
    let playlistId = req.params.playlistId;
    
    // Versuche zuerst die API-Methode
    try {
      return await getPlaylistViaAPI(playlistId, res);
    } catch (error) {
      console.log('API failed, falling back to RSS feed');
      return await getPlaylistViaRSS(playlistId, res);
    }
  } catch (error) {
    console.error('All methods failed:', error);
    return res.status(400).json({ 
      error: 'Failed to fetch playlist',
      details: 'All methods failed'
    });
  }
});

async function getPlaylistViaRSS(playlistId: string, res: express.Response) {
  // RSS-Feed URL für Playlists
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
  
  const response = await axios.get<string>(rssUrl, {
    responseType: 'text'  // Wichtig: Explizit als Text anfordern
  });
  
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(response.data as string);

  const videos = result.feed.entry?.map((entry: any) => ({
    title: entry.title[0],
    videoId: entry['yt:videoId'][0],
    thumbnail: `https://i.ytimg.com/vi/${entry['yt:videoId'][0]}/default.jpg`
  })) || [];

  return res.json(videos);
}

async function getPlaylistViaAPI(playlistId: string, res: express.Response) {
  // Ihre bestehende API-Implementierung
  const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
  });

  if (playlistId.startsWith('UU')) {
    playlistId = 'PL' + playlistId.slice(2);
  }

  const response = await youtube.playlistItems.list({
    part: ['snippet'],
    playlistId: playlistId,
    maxResults: 50
  });

  if (!response.data.items || response.data.items.length === 0) {
    throw new Error('No videos found');
  }

  const videos = response.data.items.map((item: youtube_v3.Schema$PlaylistItem) => ({
    title: item.snippet?.title || '',
    videoId: item.snippet?.resourceId?.videoId || '',
    thumbnail: item.snippet?.thumbnails?.default?.url || ''
  }));

  return res.json(videos);
}

export default router; 