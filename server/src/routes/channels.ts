router.get('/playlist/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Suche zuerst in der Datenbank
    let playlist = await Playlist.findOne({ playlistId });
    
    if (!playlist || isStale(playlist.lastFetched)) {
      // Nur wenn nötig von YouTube abrufen
      const videos = await fetchYouTubePlaylist(playlistId);
      
      if (playlist) {
        playlist.videos = videos;
        playlist.lastFetched = new Date();
        await playlist.save();
      } else {
        playlist = await Playlist.create({
          playlistId,
          videos,
          lastFetched: new Date()
        });
      }
    }

    res.json(playlist.videos);
  } catch (error) {
    res.status(500).json({ error: 'Playlist konnte nicht geladen werden' });
  }
}); 