export const Env = {
  INSTAGRAM_USERNAME: process.env.INSTAGRAM_USERNAME || "",
  INSTAGRAM_PASSWORD: process.env.INSTAGRAM_PASSWORD || "",

  TARGET_USER: process.argv[2] || "default",
};
