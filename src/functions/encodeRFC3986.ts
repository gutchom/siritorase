export default function encodeRFC3986(uri: string) {
  return encodeURIComponent(uri).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16),
  );
}
