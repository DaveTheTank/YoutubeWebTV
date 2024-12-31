import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Video {
  title: string;
  thumbnail: string;
  videoId: string;
  position: number;
}

interface VideoPlayerProps {
  playlistId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ playlistId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (playlistId) {
      loadPlaylistVideos(playlistId);
    }
  }, [playlistId]);

  const loadPlaylistVideos = async (id: string) => {
    try {
      console.log('Loading videos for playlist:', id);
      const response = await axios.get(`http://localhost:5001/api/channels/playlist/${id}`);
      
      if (!response.data || response.data.length === 0) {
        console.error('No videos found in playlist');
        setError('Keine Videos in dieser Playlist gefunden');
        return;
      }

      console.log(`Loaded ${response.data.length} videos:`, response.data);
      setVideos(response.data);
      setCurrentVideoIndex(0);
      setError('');
    } catch (error: any) {
      console.error('Error loading playlist:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Fehler beim Laden der Videos');
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!videos.length) {
    return <div>Lade Videos...</div>;
  }

  const currentVideo = videos[currentVideoIndex];

  return (
    <div className="video-player">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer; 