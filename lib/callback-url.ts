export const getCallbackUrl = () => {
  if (typeof window === "undefined") return "/";

  const { origin, protocol, host } = window.location;
  if (origin && origin !== "null") {
    return `${origin}/`;
  }

  if (protocol && host) {
    return `${protocol}//${host}/`;
  }

  return "/";
};
