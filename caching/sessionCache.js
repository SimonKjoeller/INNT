// Simpel in-memory session cache (går væk når app-processen genstartes)
// Ændringer: tilføjet max entries og simpel eviction af ældste entry.

const MAX_ENTRIES = 200; // Maks antal cache-entries

const cache = new Map();

/**
 * Hent en værdi fra session-cachen.
 * @param {string} key
 * @returns {any|undefined}
 */
export const get = (key) => cache.get(key);

/**
 * Sæt en værdi i session-cachen.
 * Hvis vi overskrider MAX_ENTRIES, fjernes det ældste entry.
 * @param {string} key
 * @param {any} value
 */
export const set = (key, value) => {
    // Hvis nøglen allerede findes, delete først så insertion-order opdateres
    if (cache.has(key)) {
        cache.delete(key);
    }
    cache.set(key, value);

    // Evict ældste entries hvis vi er over MAX_ENTRIES
    while (cache.size > MAX_ENTRIES) {
        const oldestKey = cache.keys().next().value;
        cache.delete(oldestKey);
        console.log(`[sessionCache] evicted oldest key: ${oldestKey}`);
    }
};

/**
 * Slet en nøgle fra cachen.
 * @param {string} key
 */
export const del = (key) => cache.delete(key);

/**
 * Ryd hele cachen.
 */
export const clear = () => cache.clear();

export default {
  get,
  set,
  del,
  clear
};
