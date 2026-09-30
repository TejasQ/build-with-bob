export const absoluteUrlClient = (path: string) =>
  new URL(path, window.location.origin).toString();
