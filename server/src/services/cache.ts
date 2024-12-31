import NodeCache from 'node-cache';

const cache = new NodeCache({ 
  stdTTL: 3600, // 1 Stunde Cache-Zeit
  checkperiod: 120 // Prüfe alle 2 Minuten auf abgelaufene Einträge
});

export const getCachedData = async (key: string, fetchFn: () => Promise<any>) => {
  const cachedData = cache.get(key);
  if (cachedData) return cachedData;

  const freshData = await fetchFn();
  cache.set(key, freshData);
  return freshData;
}; 