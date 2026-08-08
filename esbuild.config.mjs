import * as esbuild from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const production = process.argv.includes("--production");
const outputDirectory = "dist";

function buildInlineHtml(jsContent) {
  const escaped = jsContent.replace(/<\/script>/g, "<\\/script>");
  const template = readFileSync("index.html", "utf-8");
  return template.replace(
    '<script src="./main.js"></script>',
    () => `<script>${escaped}</script>`,
  );
}

const ctx = await esbuild.context({
  entryPoints: ["src/main.ts"],
  bundle: true,
  outfile: join(outputDirectory, "main.js"),
  format: "iife",
  target: "es2020",
  sourcemap: production ? false : "inline",
  minify: production,
  loader: { ".svg": "text" },
  platform: "browser",
  logLevel: "info",
  write: !production,
});

if (production) {
  mkdirSync(outputDirectory, { recursive: true });
  const result = await esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    write: false,
    format: "iife",
    target: "es2020",
    minify: true,
    loader: { ".svg": "text" },
    platform: "browser",
    logLevel: "info",
  });

  const jsContent = result.outputFiles[0].text;
  const html = buildInlineHtml(jsContent);
  writeFileSync(join(outputDirectory, "index.html"), html);

  rmSync(join(outputDirectory, "main.js"), { force: true });
  await ctx.dispose();
  console.log("Production build complete: dist/index.html (single file)");
} else {
  await ctx.watch();
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(
    join(outputDirectory, "index.html"),
    readFileSync("index.html", "utf-8"),
  );
  console.log("Dev build: dist/index.html + dist/main.js (watching...)");
}
