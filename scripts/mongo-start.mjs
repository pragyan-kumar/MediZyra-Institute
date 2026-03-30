import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const dbPath = resolve(process.cwd(), "mongodb-data");
const port = process.env.MONGO_PORT ?? "27017";

mkdirSync(dbPath, { recursive: true });

const child = spawn(
  "mongod",
  ["--dbpath", dbPath, "--bind_ip", "127.0.0.1", "--port", port],
  { stdio: "inherit" },
);

child.on("error", (error) => {
  if (error.code === "ENOENT") {
    console.error(
      "mongod is not installed locally. Install MongoDB Community Server, then rerun `npm run mongo:start`.",
    );
    process.exit(1);
  }

  throw error;
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
