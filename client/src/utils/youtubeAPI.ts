let isAPILoaded = false;

export const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    // Wenn die API bereits geladen wurde
    if (window.YT && isAPILoaded) {
      resolve(window.YT);
      return;
    }

    // Wenn das Script bereits existiert aber noch nicht fertig geladen ist
    if (document.getElementById('youtube-api')) {
      window.onYouTubeIframeAPIReady = () => {
        isAPILoaded = true;
        resolve(window.YT);
      };
      return;
    }

    // Lade das Script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.id = 'youtube-api';
    
    window.onYouTubeIframeAPIReady = () => {
      isAPILoaded = true;
      resolve(window.YT);
    };

    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });
}; 