export default async function loadFonts(text: string) {
  const url =
    'https://fonts.googleapis.com/css2?family=Kosugi+Maru&text=' +
    encodeURIComponent(text);
  const font = new FontFace('Kosugi Maru', `url(${url})`);
  await font.load();
  document.fonts.add(font);
}
