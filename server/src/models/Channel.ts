import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  playlistId: {
    type: String,
    required: true
  }
});

export const Channel = mongoose.model('Channel', channelSchema); 