// Hjælper til at holde styr på keys der blev cachet fra "list"-screens (popular/upcoming/trending)
// Sørger for maks 100 list-cached entries og evicter ældste ved overflow.

import sessionCache from '../caching/sessionCache';

const MAX_LIST_ENTRIES = 200;
const listMap = new Map(); 

// Tilføj key; returner evictedKey hvis en ældre entry fjernes
export const add = (key) => {
  try {
    if (listMap.has(key)) {
     
      listMap.delete(key);
    }
    listMap.set(key, Date.now());

    if (listMap.size > MAX_LIST_ENTRIES) {
      const oldestKey = listMap.keys().next().value;
      listMap.delete(oldestKey);
      // Fjern også fra sessionCache for at holde antal list-cached items under grænsen
      try { sessionCache.del(oldestKey); } catch (e) { /* ignore */ }
      console.log(`[listCache] evicted oldest list-cached key: ${oldestKey}`);
      return oldestKey;
    }
    return null;
  } catch (e) {
    console.log('[listCache] add error', e?.message || e);
    return null;
  }
};

export const has = (key) => listMap.has(key);

export const remove = (key) => {
  try {
    if (listMap.has(key)) listMap.delete(key);
  } catch (e) {
    console.log('[listCache] remove error', e?.message || e);
  }
};

export const size = () => listMap.size;

export default {
  add,
  has,
  remove,
  size
};
