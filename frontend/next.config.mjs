import fs from "node:fs";
import path from "node:path";

function parseEnvFile(filePath) {
  const parsed = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    if (line.startsWith("export ")) {
      line = line.slice(7).trim();
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (!key) {
      continue;
    }

    if (value.length >= 2 && value[0] === value[value.length - 1] && [`"`, `'`].includes(value[0])) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

function collectRootEnv() {
  const frontendRoot = process.cwd();
  const repoRoot = path.resolve(frontendRoot, "..");
  const merged = {};

  for (const root of [repoRoot, frontendRoot]) {
    for (const fileName of [".env.example", ".env", ".env.local"]) {
      const candidate = path.join(root, fileName);
      if (!fs.existsSync(candidate)) {
        continue;
      }

      Object.assign(merged, parseEnvFile(candidate));
    }
  }

  return merged;
}

function syncIconAsset() {
  const frontendRoot = process.cwd();
  const repoRoot = path.resolve(frontendRoot, "..");
  const source = path.join(repoRoot, "assets", "icon.jpg");
  const targets = [
    path.join(frontendRoot, "public", "icon.jpg"),
    path.join(frontendRoot, "app", "icon.jpg"),
  ];

  if (!fs.existsSync(source)) {
    return;
  }

  for (const target of targets) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function getIconVersion() {
  const frontendRoot = process.cwd();
  const repoRoot = path.resolve(frontendRoot, "..");
  const source = path.join(repoRoot, "assets", "icon.jpg");

  if (!fs.existsSync(source)) {
    return "1";
  }

  const stats = fs.statSync(source);
  return String(Math.floor(stats.mtimeMs));
}

const rootEnv = collectRootEnv();
const publicEnv = Object.fromEntries(
  Object.entries({
    ...rootEnv,
    ...process.env,
    NEXT_PUBLIC_ICON_VERSION: process.env.NEXT_PUBLIC_ICON_VERSION ?? getIconVersion(),
  }).filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
);

syncIconAsset();

const nextConfig = {
  typedRoutes: false,
  devIndicators: false,
  env: publicEnv
};

export default nextConfig;
