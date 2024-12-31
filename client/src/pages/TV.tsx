import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Channel {
  _id: string;
  name: string;
  description: string;
  category: string;
  playlistId: string;
}

interface Video {
  title: string;
  videoId: string;
  thumbnail: string;
}

interface ProgramInfo {
  title: string;
  videoId: string;
  startTime: string;
  endTime: string;
  isPlaying: boolean;
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
}

// Füge diese SVG-Icons als Komponenten hinzu
const Icons = {
  Previous: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 20L9 12L19 4V20Z" />
      <path d="M5 19V5" />
    </svg>
  ),
  Next: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 4L15 12L5 20V4Z" />
      <path d="M19 5V19" />
    </svg>
  ),
  VolumeOn: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5L6 9H2V15H6L11 19V5Z" />
      <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 12C17.0039 13.3308 16.4774 14.6024 15.54 15.54" />
      <path d="M18.07 5.93C19.9447 7.80528 20.9979 10.3447 20.9979 13C20.9979 15.6553 19.9447 18.1947 18.07 20.07" />
    </svg>
  ),
  VolumeOff: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 5L6 9H2V15H6L11 19V5Z" />
      <path d="M23 9L17 15" />
      <path d="M17 9L23 15" />
    </svg>
  ),
  Teletext: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21H16" />
      <path d="M12 17V21" />
      <path d="M6 8H18" />
      <path d="M6 12H18" />
    </svg>
  ),
  Fullscreen: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8" />
      <path d="M21 8V5C21 3.89543 20.1046 3 19 3H16" />
      <path d="M3 16V19C3 20.1046 3.89543 21 5 21H8" />
      <path d="M16 21H19C20.1046 21 21 20.1046 21 19V16" />
    </svg>
  ),
  Power: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18.36 6.64C19.6184 7.89879 20.4753 9.50244 20.8223 11.2482C21.1693 12.9939 20.9909 14.8034 20.3096 16.4478C19.6284 18.0921 18.4748 19.4976 16.9948 20.4864C15.5148 21.4752 13.7749 22.0029 11.995 22.0029C10.2151 22.0029 8.47515 21.4752 6.99517 20.4864C5.51519 19.4976 4.36164 18.0921 3.68036 16.4478C2.99909 14.8034 2.82069 12.9939 3.16772 11.2482C3.51475 9.50244 4.37162 7.89879 5.63 6.64" />
      <path d="M12 2V12" />
    </svg>
  ),
  Guide: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
};

const TV: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [videos, setVideos] = useState<{ [key: string]: Video[] }>({});
  const [error, setError] = useState<string>('');
  const [showTeletext, setShowTeletext] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isPowered, setIsPowered] = useState(true);
  const [playersReady, setPlayersReady] = useState<{ [key: string]: boolean }>({});
  const playerRefs = useRef<{ [key: string]: HTMLIFrameElement }>({});
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const [programSchedule, setProgramSchedule] = useState<ProgramInfo[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [players, setPlayers] = useState<{ [key: string]: YouTubePlayer }>({});
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const channelInfoTimeout = useRef<NodeJS.Timeout>();
  const [controlsVisible, setControlsVisible] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // Füge dieses Icon hinzu
  const GripIcon = () => (
    <svg viewBox="0 0 36 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L18 6L34 2" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );

  // Füge diese Funktion hinzu
  const toggleControls = () => {
    setControlsVisible(prev => !prev);
  };

  // Füge einen Effect für das automatische Ausblenden hinzu
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (controlsVisible) {
      timeout = setTimeout(() => {
        setControlsVisible(false);
      }, 5000); // Blendet nach 5 Sekunden aus
    }
    return () => clearTimeout(timeout);
  }, [controlsVisible]);

  // Lade alle Kanäle und initialisiere die Player einmalig
  useEffect(() => {
    const initializeChannels = async () => {
      try {
        const response = await axios.get('/api/channels');
        if (response.data && response.data.length > 0) {
          setChannels(response.data);
          setCurrentChannel(response.data[0]);
          
          // Lade Videos für alle Kanäle
          response.data.forEach(channel => {
            loadVideos(channel.playlistId, channel._id);
          });
        }
      } catch (error) {
        setError('Kanäle konnten nicht geladen werden');
      }
    };

    initializeChannels();
  }, []);

  // Lautstärkesteuerung
  useEffect(() => {
    if (currentChannel) {
      Object.entries(playerRefs.current).forEach(([channelId, player]) => {
        const message = {
          event: 'command',
          func: channelId === currentChannel._id ? (isMuted ? 'mute' : 'unMute') : 'mute'
        };
        player.contentWindow?.postMessage(JSON.stringify(message), '*');
      });
    }
  }, [currentChannel, isMuted]);

  const loadVideos = async (playlistId: string, channelId: string) => {
    try {
      const response = await axios.get(`/api/channels/playlist/${playlistId}`);
      if (response.data && Array.isArray(response.data)) {
        // Filtere Shorts aus, aber stelle sicher dass Videos übrig bleiben
        const filteredVideos = response.data.filter(video => {
          // Einfachere Shorts-Erkennung
          const isShort = video.videoId.length < 6 || 
                         video.title.toLowerCase().includes('#shorts') ||
                         video.title.toLowerCase().includes('#short');
          return !isShort;
        });
        
        // Wenn alle Videos gefiltert wurden, verwende die originalen
        const videosToUse = filteredVideos.length > 0 ? filteredVideos : response.data;
        
        setVideos(prev => ({
          ...prev,
          [channelId]: videosToUse
        }));

        // Markiere den Player als bereit
        setPlayersReady(prev => ({
          ...prev,
          [channelId]: true
        }));
      }
    } catch (error) {
      setError('Videos konnten nicht geladen werden');
    }
  };

  const handleChannelChange = (newChannel: Channel) => {
    setCurrentChannel(newChannel);
    
    // Zeige Channel-Info
    setShowChannelInfo(true);
    
    // Verstecke nach 3 Sekunden
    if (channelInfoTimeout.current) {
      clearTimeout(channelInfoTimeout.current);
    }
    channelInfoTimeout.current = setTimeout(() => {
      setShowChannelInfo(false);
    }, 3000);
  };

  const nextChannel = () => {
    const currentIndex = channels.findIndex(c => c._id === currentChannel?._id);
    const nextIndex = (currentIndex + 1) % channels.length;
    handleChannelChange(channels[nextIndex]);
  };

  const previousChannel = () => {
    const currentIndex = channels.findIndex(c => c._id === currentChannel?._id);
    const prevIndex = currentIndex <= 0 ? channels.length - 1 : currentIndex - 1;
    handleChannelChange(channels[prevIndex]);
  };

  const getNextFiveVideos = (channelVideos: Video[]) => {
    const now = new Date();
    const minutesSinceStart = Math.floor((Date.now() % (24 * 60 * 60 * 1000)) / (30 * 60 * 1000));
    const currentIndex = minutesSinceStart % channelVideos.length;
    
    return Array.from({ length: 5 }, (_, i) => {
      const videoIndex = (currentIndex + i) % channelVideos.length;
      const startTime = new Date(now.getTime() + (i * 30 * 60000));
      return {
        ...channelVideos[videoIndex],
        time: startTime.toLocaleTimeString('de-DE', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    });
  };

  const getVideoStartTime = (channelId: string) => {
    if (!videos[channelId]) return 0;
    const videoDuration = 30 * 60; // 30 Minuten in Sekunden
    const now = Math.floor(Date.now() / 1000); // Aktuelle Zeit in Sekunden
    const startTime = Math.floor(now / videoDuration) * videoDuration;
    return startTime;
  };

  // Füge YouTube API Event Listener hinzu
  useEffect(() => {
    // YouTube API Event Handler
    window.onYouTubeIframeAPIReady = () => {
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange' && data.info.videoData) {
            setCurrentDuration(data.info.videoData.duration);
          }
          if (data.event === 'onProgress') {
            setCurrentProgress(data.info.currentTime);
          }
        } catch (e) {
          // Ignoriere nicht-JSON Messages
        }
      });
    };
  }, []);

  const skipVideo = () => {
    if (!currentChannel) return;
    const player = players[currentChannel._id];
    if (player) {
      // Verwende die YouTube Player API direkt
      player.playVideo(); // Starte das Video neu, falls es pausiert ist
      // @ts-ignore - YouTube API types
      player.nextVideo(); // Gehe zum nächsten Video
      
      setCurrentVideoIndex(prev => (prev + 1) % (videos[currentChannel._id]?.length || 1));
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Aktualisiere den Programmplan
  useEffect(() => {
    const updateSchedule = () => {
      if (currentChannel && videos[currentChannel._id]) {
        const now = new Date();
        const channelVideos = videos[currentChannel._id];
        const videoDuration = 30 * 60 * 1000;
        
        const schedule: ProgramInfo[] = [];
        for (let i = -2; i < 8; i++) {
          const videoIndex = (currentVideoIndex + i + channelVideos.length) % channelVideos.length;
          const video = channelVideos[videoIndex];
          const startTime = new Date(now.getTime() + (i * videoDuration));
          const endTime = new Date(startTime.getTime() + videoDuration);
          
          schedule.push({
            title: video.title,
            videoId: video.videoId,
            startTime: startTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            isPlaying: i === 0
          });

          if (i === 0) {
            setCurrentVideoTitle(video.title);
          }
        }
        
        setProgramSchedule(schedule);
      }
    };

    updateSchedule();
    const interval = setInterval(updateSchedule, 30000);
    return () => clearInterval(interval);
  }, [currentChannel, videos, currentVideoIndex]);

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    
    if (currentChannel) {
      const player = playerRefs.current[currentChannel._id];
      if (player) {
        player.contentWindow?.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [newVolume]
        }), '*');
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const initializeYouTubePlayer = (channelId: string, iframe: HTMLIFrameElement) => {
    // @ts-ignore - YouTube API types
    const player = new YT.Player(iframe, {
      events: {
        onReady: (event) => {
          setPlayers(prev => ({
            ...prev,
            [channelId]: event.target
          }));
          
          // Starte das Video mit einem kleinen Delay
          setTimeout(() => {
            event.target.playVideo();
            if (currentChannel?._id !== channelId) {
              event.target.mute();
            }
          }, 100);
        },
        onStateChange: (event) => {
          // Wenn das Video stoppt oder pausiert, starte es neu
          if (event.data === YT.PlayerState.ENDED || 
              event.data === YT.PlayerState.PAUSED) {
            event.target.playVideo();
          }
        },
        onError: (event) => {
          // Bei Fehlern, versuche das Video neu zu starten
          console.log('YouTube Player Error:', event.data);
          setTimeout(() => {
            event.target.playVideo();
          }, 1000);
        }
      }
    });
  };

  useEffect(() => {
    if (currentChannel) {
      // Stumm schalten aller nicht-aktiven Kanäle
      Object.entries(players).forEach(([channelId, player]) => {
        if (channelId === currentChannel._id) {
          if (isMuted) {
            player.mute();
          } else {
            player.unMute();
            player.setVolume(volume);
          }
        } else {
          player.mute();
        }
      });
    }
  }, [currentChannel, isMuted, volume]);

  // Füge einen Effect hinzu, der regelmäßig prüft, ob die Videos laufen
  useEffect(() => {
    const checkInterval = setInterval(() => {
      Object.values(players).forEach(player => {
        // @ts-ignore - YouTube API types
        if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
          player.playVideo();
        }
      });
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [players]);

  // Modifiziere den Power-Toggle
  const togglePower = () => {
    setIsPowered(!isPowered);
    
    // Stumm schalten aller Player beim Ausschalten
    if (isPowered) { // wenn es gerade eingeschaltet ist
      Object.values(players).forEach(player => {
        player.mute();
      });
    } else { // wenn es wieder eingeschaltet wird
      // Stelle den Sound für den aktiven Kanal wieder her
      if (currentChannel && !isMuted) {
        const player = players[currentChannel._id];
        if (player) {
          player.unMute();
          player.setVolume(volume);
        }
      }
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="tv-container" ref={containerRef}>
      <div className={`tv-screen ${!isPowered ? 'powered-off' : ''}`}>
        {/* Channel Info Overlay */}
        <div className={`channel-info-overlay ${showChannelInfo ? 'visible' : ''}`}>
          <div className="channel-number">
            {(channels.findIndex(c => c._id === currentChannel?._id) + 1).toString().padStart(2, '0')}
          </div>
          <div className="channel-name-display">{currentChannel?.name}</div>
          <div className="channel-description">{currentChannel?.description}</div>
        </div>

        {/* Static Effect */}
        <div className="static-overlay" />

        {channels.map(channel => (
          <div
            key={channel._id}
            className="channel-container"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              visibility: currentChannel?._id === channel._id ? 'visible' : 'hidden'
            }}
          >
            {videos[channel._id] && (
              <iframe
                ref={el => {
                  if (el && !players[channel._id]) {
                    initializeYouTubePlayer(channel._id, el);
                  }
                }}
                src={`https://www.youtube.com/embed/${videos[channel._id][0].videoId}?` +
                     `enablejsapi=1&` +
                     `autoplay=1&` +
                     `controls=0&` +
                     `modestbranding=1&` +
                     `rel=0&` +
                     `showinfo=0&` +
                     `playlist=${videos[channel._id].map(v => v.videoId).join(',')}&` +
                     `loop=1&` +
                     `playsinline=1`
                }
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                playsInline
              />
            )}
          </div>
        ))}

        {showTeletext && currentChannel && (
          <div className="teletext-overlay">
            <div className="teletext-content">
              <div className="teletext-header">
                <div className="channel-info">
                  <span className="channel-name">{currentChannel.name}</span>
                  <span className="current-time">
                    {new Date().toLocaleTimeString('de-DE', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="video-controls">
                  <button onClick={skipVideo}>Nächstes</button>
                </div>
              </div>

              <div className="current-program">
                <h3>JETZT</h3>
                <div className="program-item current">
                  <span className="program-time">
                    {programSchedule.find(p => p.isPlaying)?.startTime}
                  </span>
                  <span className="program-title">{currentVideoTitle}</span>
                </div>
              </div>

              <div className="program-timeline">
                <h3>PROGRAMM</h3>
                <div className="program-list">
                  {programSchedule.map((program, index) => (
                    <div 
                      key={`${program.videoId}-${index}`}
                      className={`program-item ${program.isPlaying ? 'active' : ''}`}
                    >
                      <span className="program-time">{program.startTime}</span>
                      <span className="program-title">{program.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="all-channels-overview">
                <h3>ALLE KANÄLE</h3>
                <div className="channels-grid">
                  {channels.map((channel, index) => {
                    const channelVideos = videos[channel._id];
                    const currentVideo = channelVideos?.[currentVideoIndex];
                    const nextVideo = channelVideos?.[(currentVideoIndex + 1) % channelVideos?.length];
                    
                    return (
                      <div 
                        key={channel._id} 
                        className={`channel-row ${currentChannel?._id === channel._id ? 'active' : ''}`}
                        onClick={() => handleChannelChange(channel)}
                      >
                        <div className="channel-info">
                          <span className="channel-number">{(index + 1).toString().padStart(2, '0')}</span>
                          <span className="channel-name">{channel.name}</span>
                        </div>
                        <div className="program-info">
                          <div className="now-playing">
                            <span className="time">JETZT:</span>
                            <span className="title">{currentVideo?.title || 'Lädt...'}</span>
                          </div>
                          <div className="next-up">
                            <span className="time">DANACH:</span>
                            <span className="title">{nextVideo?.title || 'Lädt...'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modifizierter Grip Handle */}
      <div 
        className={`control-grip ${controlsVisible ? 'active' : ''}`} 
        onClick={toggleControls}
      >
        <GripIcon />
      </div>

      {/* Channel Guide */}
      <div className={`channel-guide ${showGuide ? 'visible' : ''}`}>
        <div className="channel-list">
          {channels.map((channel, index) => (
            <div
              key={channel._id}
              className={`channel-list-item ${currentChannel?._id === channel._id ? 'active' : ''}`}
              onClick={() => {
                handleChannelChange(channel);
                setShowGuide(false);
              }}
            >
              <div className="channel-number-badge">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="channel-details">
                <div className="channel-name">{channel.name}</div>
                <div className="current-show">
                  {videos[channel._id]?.[currentVideoIndex]?.title || 'Lädt...'}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="program-grid">
          <div className="program-grid-header">
            <h2>{currentChannel?.name}</h2>
            <div className="current-show">Aktuelles Programm</div>
          </div>
          <div className="program-grid-content">
            {programSchedule.map((program, index) => (
              <div key={index} className="program-card">
                <div className="program-time">{program.startTime}</div>
                <div className="program-title">{program.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`control-bar ${controlsVisible ? 'visible' : ''}`}>
        <div className="channel-controls">
          <button onClick={previousChannel} title="Vorheriger Kanal">
            <Icons.Previous />
          </button>
          <button onClick={nextChannel} title="Nächster Kanal">
            <Icons.Next />
          </button>
        </div>

        <div className="center-controls">
          <div className="volume-control">
            <button onClick={() => setIsMuted(!isMuted)} title={isMuted ? "Ton an" : "Ton aus"}>
              {isMuted ? <Icons.VolumeOff /> : <Icons.VolumeOn />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="right-controls">
          <button onClick={() => setShowGuide(!showGuide)} title="Programmführer">
            <Icons.Guide />
          </button>
          <button onClick={() => setShowTeletext(!showTeletext)} title="Teletext">
            <Icons.Teletext />
          </button>
          <button onClick={toggleFullscreen} title="Vollbild">
            <Icons.Fullscreen />
          </button>
          <button 
            onClick={togglePower}
            className={`power-button ${!isPowered ? 'off' : ''}`}
            title="Ein/Aus"
          >
            <Icons.Power />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TV; 