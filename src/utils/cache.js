// Lightweight in-memory and sessionStorage SWR Cache for 0ms instant page loads
const memoryCache = new Map();

export const getCachedData = (key) => {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }
  try {
    const raw = sessionStorage.getItem(`tcc_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoryCache.set(key, parsed);
      return parsed;
    }
  } catch (err) {
    console.debug('Cache read fallback:', err);
  }
  return null;
};

export const setCachedData = (key, data) => {
  if (!data) return;
  memoryCache.set(key, data);
  try {
    sessionStorage.setItem(`tcc_cache_${key}`, JSON.stringify(data));
  } catch (err) {
    console.debug('Cache write fallback:', err);
  }
};

// Prefetch helper to preload resources into cache during idle time or hover
export const prefetchResource = async (key, url) => {
  if (memoryCache.has(key)) return;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        if (key === 'projects') {
          const mapped = json.map(p => ({
            ...p,
            tags: (Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : (Array.isArray(p.technologies) ? p.technologies : [])).filter(Boolean),
            links: p.links || { live: p.liveLink || '', github: p.githubLink || '' }
          }));
          setCachedData(key, mapped);
        } else {
          setCachedData(key, json);
        }
      }
    }
  } catch (err) {
    console.debug('Prefetch failed:', err);
  }
};
