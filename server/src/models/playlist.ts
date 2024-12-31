import mongoose from 'mongoose';

const PlaylistSchema = new mongoose.Schema({
  channelId: String,
  playlistId: String,
  videos: [{
    title: String,
    videoId: String,
    thumbnail: String,
    updatedAt: Date
  }],
  lastFetched: Date
});

export const Playlist = mongoose.model('Playlist', PlaylistSchema); 