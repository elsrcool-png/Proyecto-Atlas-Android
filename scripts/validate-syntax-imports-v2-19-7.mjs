import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = process.cwd();
const srcRoot = path.join(root, "src");
const extensions = ["", ".js", ".jsx", ".mjs", ".json", ".css", ".png", ".webp", ".svg"];
const codeExtensions = new Set([".js", ".jsx", ".mjs"]);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function resolveLocal(fromFile, specifier) {
  let base;
  if (specifier.startsWith("@/")) base = path.join(srcRoot, specifier.slice(2));
  else if (specifier.startsWith(".")) base = path.resolve(path.dirname(fromFile), specifier);
  else return true;

  for (const ext of extensions) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return true;
  }
  for (const ext of extensions.slice(1)) {
    const candidate = path.join(base, `index${ext}`);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return true;
  }
  return false;
}

const files = walk(srcRoot).filter(file => codeExtensions.has(path.extname(file)));
const syntaxErrors = [];
const importErrors = [];
let importCount = 0;

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      allowJs: true,
    },
    reportDiagnostics: true,
    fileName: file,
  });
  for (const d of result.diagnostics || []) {
    if (d.category !== ts.DiagnosticCategory.Error) continue;
    syntaxErrors.push(`${path.relative(root, file)}: ${ts.flattenDiagnosticMessageText(d.messageText, " ")}`);
  }

  const importRe = /(?:from\s*|import\s*\()\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(importRe)) {
    const specifier = match[1];
    if (!specifier.startsWith(".") && !specifier.startsWith("@/")) continue;
    importCount += 1;
    if (!resolveLocal(file, specifier)) importErrors.push(`${path.relative(root, file)} -> ${specifier}`);
  }
}

if (syntaxErrors.length || importErrors.length) {
  for (const item of syntaxErrors) console.error(`✗ Sintaxis: ${item}`);
  for (const item of importErrors) console.error(`✗ Import: ${item}`);
  console.error(`\nVALIDACIÓN FALLIDA — ${syntaxErrors.length} errores sintácticos, ${importErrors.length} imports rotos`);
  process.exit(1);
}

console.log(`✓ ${files.length} archivos JS/JSX/MJS sin errores sintácticos`);
console.log(`✓ ${importCount} imports locales resueltos`);
console.log("VALIDACIÓN DE SINTAXIS E IMPORTS v2.19.7 CORRECTA");
