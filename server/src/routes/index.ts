import express from 'express';
import channelRoutes from './channelRoutes';

const router = express.Router();

router.use('/channels', channelRoutes);  // Basis-Route ist jetzt /api/channels

export default router; 