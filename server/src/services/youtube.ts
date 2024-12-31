export const fetchYouTubePlaylist = async (playlistId: string) => {
  try {
    // Versuche YouTube API
    return await fetchFromYouTubeAPI(playlistId);
  } catch (error) {
    // Bei Quota-Überschreitung: Verwende gecachte Daten
    const cachedPlaylist = await Playlist.findOne({ playlistId });
    if (cachedPlaylist) {
      return cachedPlaylist.videos;
    }
    throw error;
  }
}; 