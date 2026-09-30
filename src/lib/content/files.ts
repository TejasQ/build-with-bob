import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const root = process.cwd();

export function readJson<T>(relative: string): T {
  return JSON.parse(fs.readFileSync(path.join(root, relative), "utf8")) as T;
}

export function readMarkdownDir(relative: string) {
  const dir = path.join(root, relative);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      return { file, data, body: content.trim() };
    });
}
