// Parse content body to blocks (safe, no HTML). Supports:
// - Image: ![alt](url)
// - Video: @[video](url) or @[영상](url)
//
// Returns blocks:
// - { type: 'text', text }
// - { type: 'image', alt, url }
// - { type: 'video', url }
export function parseContentBody(body) {
  const text = typeof body === 'string' ? body : '';
  if (!text) return [];

  const pattern = /!\[([^\]]*)\]\(([^)]+)\)|@\[(video|영상)\]\(([^)]+)\)/g;
  const blocks = [];

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const index = match.index;
    if (index > lastIndex) {
      blocks.push({ type: 'text', text: text.slice(lastIndex, index) });
    }

    // image: match[1]=alt, match[2]=url
    if (match[2]) {
      blocks.push({
        type: 'image',
        alt: match[1] || '이미지',
        url: match[2],
      });
    } else {
      // video: match[3]=kind, match[4]=url
      blocks.push({
        type: 'video',
        url: match[4],
      });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    blocks.push({ type: 'text', text: text.slice(lastIndex) });
  }

  return blocks;
}

export function getVideoEmbedInfo(url) {
  const raw = typeof url === 'string' ? url.trim() : '';
  if (!raw) return { kind: 'unknown', src: '' };

  // YouTube
  const ytShort = raw.match(/https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const ytWatch = raw.match(/https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  const ytEmbed = raw.match(/https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  const id = ytShort?.[1] || ytWatch?.[2] || ytEmbed?.[2];
  if (id) {
    return { kind: 'youtube', src: `https://www.youtube.com/embed/${id}` };
  }

  // Other: mp4/webm/ogg or blob url
  return { kind: 'video', src: raw };
}


