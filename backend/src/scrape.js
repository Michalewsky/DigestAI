function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchPreviewText(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'DigestAI/1.0 (+https://example.local)'
    }
  });

  if (!response.ok) {
    throw new Error(`Could not fetch URL (${response.status})`);
  }

  const html = await response.text();
  const text = stripHtml(html);
  return text.slice(0, 1800);
}
