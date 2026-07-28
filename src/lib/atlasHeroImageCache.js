const cache = new Map();
export function getHeroImageEntry(src) { return cache.get(src) || null; }
export function loadHeroImage(src) {
  if (!src) return Promise.reject(new Error("Ruta de imagen vacía"));
  if (cache.has(src)) return cache.get(src).promise;
  const image = new Image();
  const entry = { image, status: "loading", error: null, promise: null };
  entry.promise = new Promise((resolve, reject) => { image.onload=()=>{entry.status='ready';resolve(image);}; image.onerror=(e)=>{entry.status='error';entry.error=e;reject(new Error(`No se pudo cargar ${src}`));}; });
  cache.set(src, entry); image.src=src; return entry.promise;
}
export function clearHeroImageCache() { cache.clear(); }
