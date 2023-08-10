export function ogp(id: string): string {
  const path = `/${id}/ogp.png`;
  return window.location.origin + path;
}

export function pic(id: string, title: string): string {
  const path = `/${id}/${encodeURIComponent(title)}.png`;
  return window.location.origin + path;
}

export function thumb(id: string, title: string): string {
  const path = `/${id}/${encodeURIComponent(title)}_thumbnail.png`;
  return window.location.origin + path;
}
