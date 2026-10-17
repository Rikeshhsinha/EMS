export function cookieOptions() {
  const production = process.env.NODE_ENV === "production";
  const secure = process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : production;
  const sameSite = process.env.COOKIE_SAME_SITE || (production ? "none" : "lax");

  return {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

export function clearCookieOptions() {
  const { maxAge, ...options } = cookieOptions();
  return options;
}
