export interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
}

export interface PlaylistVideos {
  [playlistId: string]: Video[];
}

export interface ChannelVideos {
  [channelId: string]: Video[];
}

// Playlist Videos
export const playlists: PlaylistVideos = {
  "PLOzDu-MXXLliO9fBNZOQTBDddoA3FzZUo": [ // Lofi Music
    {
      videoId: "jfKfPfyJRdk",
      title: "lofi hip hop radio - beats to relax/study to",
      thumbnail: "https://i.ytimg.com/vi/jfKfPfyJRdk/default.jpg"
    }
  ]
};

// Kanal Videos
export const channelVideos: ChannelVideos = {
  "UUo8eiRuRgWXenVBBEWqCWZw": [ // Trymacs
    {
      videoId: "video1",
      title: "Trymacs Video 1",
      thumbnail: "https://i.ytimg.com/vi/video1/default.jpg"
    }
  ]
}; 