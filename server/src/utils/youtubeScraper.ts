import puppeteer from 'puppeteer';
import { Video } from '../models/video';

export async function getChannelVideos(channelId: string, maxVideos: number = 50): Promise<Video[]> {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Block Ressourcen die wir nicht brauchen
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });

    const cleanChannelId = channelId.replace('UU', 'UC');
    console.log(`Scraping channel: ${cleanChannelId}`);

    // Versuche zuerst die @username URL
    let success = false;
    try {
      await page.goto(`https://www.youtube.com/@${cleanChannelId}/videos`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      success = true;
    } catch (e) {
      console.log('Could not load @username URL, trying channel ID URL');
    }

    // Wenn @username nicht funktioniert, versuche die channel ID URL
    if (!success) {
      await page.goto(`https://www.youtube.com/channel/${cleanChannelId}/videos`, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
    }

    // Warte auf Video-Container
    await page.waitForSelector('#contents');
    console.log('Found video container');

    // Scrolle um mehr Videos zu laden
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Extrahiere Video-Informationen
    const videos = await page.evaluate((max) => {
      const videoElements = document.querySelectorAll('ytd-rich-item-renderer, ytd-grid-video-renderer');
      console.log(`Found ${videoElements.length} video elements`);
      
      return Array.from(videoElements).slice(0, max).map(element => {
        const anchor = element.querySelector('#video-title-link, #video-title');
        if (!anchor) return null;

        const href = anchor.getAttribute('href');
        if (!href) return null;

        const videoId = href.split('v=')[1]?.split('&')[0] || 
                       href.split('/').pop()?.split('?')[0];
        if (!videoId) return null;

        const title = anchor.getAttribute('title') || 
                     anchor.textContent?.trim() || 
                     'Untitled Video';

        return {
          videoId,
          title,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/default.jpg`
        };
      }).filter(item => item !== null) as Video[];
    }, maxVideos);

    console.log(`Scraped ${videos.length} videos`);
    await browser.close();
    return videos;

  } catch (error) {
    console.error('Error scraping channel:', error);
    await browser.close();
    throw error;
  }
}

export async function getPlaylistVideos(playlistId: string, maxVideos: number = 50): Promise<Video[]> {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Block unnötige Ressourcen
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`Scraping playlist: ${playlistId}`);
    await page.goto(`https://www.youtube.com/playlist?list=${playlistId}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    await page.waitForSelector('ytd-playlist-video-renderer');
    console.log('Found playlist container');

    // Scrolle um mehr Videos zu laden
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const videos = await page.evaluate((max) => {
      const videoElements = document.querySelectorAll('ytd-playlist-video-renderer');
      console.log(`Found ${videoElements.length} video elements`);
      
      return Array.from(videoElements).slice(0, max).map(element => {
        const anchor = element.querySelector('a#video-title');
        if (!anchor) return null;

        const href = anchor.getAttribute('href');
        if (!href) return null;

        const videoId = href.split('v=')[1]?.split('&')[0];
        if (!videoId) return null;

        const title = anchor.getAttribute('title') || 
                     anchor.textContent?.trim() || 
                     'Untitled Video';

        return {
          videoId,
          title,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/default.jpg`
        };
      }).filter(item => item !== null) as Video[];
    }, maxVideos);

    console.log(`Scraped ${videos.length} videos`);
    await browser.close();
    return videos;

  } catch (error) {
    console.error('Error scraping playlist:', error);
    await browser.close();
    throw error;
  }
} 