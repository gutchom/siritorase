window.addEventListener('load', () => {
  const params = new URLSearchParams(window.location.search);
  const path = params.get('redirect');
  if (path) window.location.replace(path);
});
