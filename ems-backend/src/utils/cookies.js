export function cookieOptions() {
  const secure = process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: process.env.COOKIE_SAME_SITE || "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000
  };
}
export function clearCookieOptions() {
  const { maxAge, ...options } = cookieOptions();
  return options;
}
