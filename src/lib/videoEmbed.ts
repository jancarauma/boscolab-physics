function sanitizeVideoId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '').trim();
}

export function toEmbedVideoUrl(rawUrl: string): string | null {
  const value = String(rawUrl || '').trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch (_) {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const pathParts = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be') {
    const id = sanitizeVideoId(pathParts[0] || '');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    if (pathParts[0] === 'watch') {
      const id = sanitizeVideoId(url.searchParams.get('v') || '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (pathParts[0] === 'embed' || pathParts[0] === 'shorts' || pathParts[0] === 'live') {
      const id = sanitizeVideoId(pathParts[1] || '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const idx = pathParts[0] === 'video' ? 1 : 0;
    const id = (pathParts[idx] || '').replace(/\D/g, '');
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  return url.href;
}

export function isValidVideoUrl(rawUrl: string): boolean {
  return toEmbedVideoUrl(rawUrl) !== null;
}
