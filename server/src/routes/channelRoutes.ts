import express from 'express';
import { channelController } from '../controllers/channelController';

const router = express.Router();

router.get('/', channelController.getChannels);
router.post('/', channelController.createChannel);
router.delete('/:id', channelController.deleteChannel);
router.get('/playlist/:id', channelController.getPlaylistVideos);

export default router; 