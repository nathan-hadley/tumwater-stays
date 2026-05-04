import fs from "fs";
import path from "path";

import type { Unit } from "./units";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export function getUnitPhotos(unitId: Unit["id"]): string[] {
  const dir = path.join(process.cwd(), "public", "photos", unitId);
  try {
    return fs
      .readdirSync(dir)
      .filter((f) => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort()
      .map((f) => `/photos/${unitId}/${f}`);
  } catch {
    return [];
  }
}
