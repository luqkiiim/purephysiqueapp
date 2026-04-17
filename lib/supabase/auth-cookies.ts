type CookieReader = {
  getAll(): Array<{ name: string }>;
};

export function hasSupabaseAuthCookies(cookieReader: CookieReader) {
  return cookieReader
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"));
}
