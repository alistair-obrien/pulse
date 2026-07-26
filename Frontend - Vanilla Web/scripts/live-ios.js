import { spawn } from "node:child_process";
import "dotenv/config";

spawn("npx", [
  "cap",
  "run",
  "ios",
  "-l",
  "--host",
  process.env.VITE_CAP_HOST,
  "--port",
  process.env.VITE_CAP_PORT,
], {
  stdio: "inherit",
  shell: true,
});