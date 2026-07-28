import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const extensions = ["", ".js", ".mjs", ".json"];

function resolveFile(base) {
  for (const ext of extensions) {
    const file = base + ext;
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  for (const ext of extensions.slice(1)) {
    const file = path.join(base, `index${ext}`);
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = resolveFile(path.join(root, "src", specifier.slice(2)));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    const base = path.resolve(path.dirname(new URL(context.parentURL).pathname), specifier);
    const file = resolveFile(base);
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
