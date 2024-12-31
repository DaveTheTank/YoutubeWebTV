declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export class PlayerManager {
  private static instance: PlayerManager;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }

  loadYouTubeAPI(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve) => {
      // Wenn die API bereits geladen ist
      if (window.YT) {
        resolve();
        return;
      }

      // API laden
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    });

    return this.loadPromise;
  }

  async createPlayer(elementId: string, options: any): Promise<any> {
    await this.loadYouTubeAPI();

    return new Promise((resolve) => {
      new window.YT.Player(elementId, {
        ...options,
        events: {
          ...options.events,
          onReady: (event: any) => {
            if (options.events?.onReady) {
              options.events.onReady(event);
            }
            resolve(event.target);
          }
        }
      });
    });
  }
} 