// Builds the live demos under public/demo from the real apps, so the website
// shows exactly what Nikxel looks like:
//   public/demo/app/    the Nikxel window's page (../../src/DashboardPage.swift) with sample data
//   public/demo/admin/  the team dashboard (../../../nikxel-admin) with a mocked API
// Run: node demo/build.mjs   (needs the nikxel-admin clone beside nikxel for the second)
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(here, "..");
const repo = path.join(site, "..", "..");
const admin = path.join(repo, "..", "nikxel-admin");

function swiftRaw(file, decl) {
  const text = fs.readFileSync(path.join(repo, "src", file), "utf8");
  const start = text.indexOf(decl);
  if (start < 0) throw new Error(`${decl} not found in ${file}`);
  const from = text.indexOf('#"""', start) + 4;
  return text.slice(from, text.indexOf('"""#', from)).replace(/^\n/, "");
}

/* ---------- the Nikxel window ---------- */
const app = path.join(site, "public", "demo", "app");
fs.mkdirSync(app, { recursive: true });
const markdown = swiftRaw("AvatarChat.swift", "static let markdownJS");
let page = swiftRaw("DashboardPage.swift", "static let html").split("\\#(AvatarChat.markdownJS)").join(markdown);
if (page.includes("\\#(")) throw new Error("DashboardPage.swift has an interpolation this script doesn't fill");
const preamble =
  '<script src="framer-motion-dom.js"></script>' +
  "<script>document.documentElement.style.setProperty('--clouds', 'url(clouds.png)')</script>" +
  '<script src="shim.js"></script>';
page = page.replace(/<head>/i, "<head>" + preamble);
fs.writeFileSync(path.join(app, "index.html"), page);
fs.copyFileSync(path.join(repo, "vendor", "clouds.png"), path.join(app, "clouds.png"));
fs.copyFileSync(path.join(repo, "vendor", "framer-motion-dom.js"), path.join(app, "framer-motion-dom.js"));
fs.copyFileSync(path.join(here, "app-shim.js"), path.join(app, "shim.js"));
// meeting.html (the sample summary the reader opens) is made once by demo/meeting.mjs and kept.
console.log("✓ public/demo/app");

/* ---------- the team dashboard ---------- */
if (!fs.existsSync(admin)) {
  console.log("· skipped the team dashboard: no clone at", admin);
} else {
  const work = path.join(here, ".admin-build");
  fs.rmSync(work, { recursive: true, force: true });
  fs.mkdirSync(work);
  for (const f of ["index.html", "package.json", "vite.config.js", "src", "public"]) fs.cpSync(path.join(admin, f), path.join(work, f), { recursive: true });
  fs.symlinkSync(path.join(admin, "node_modules"), path.join(work, "node_modules"));
  fs.copyFileSync(path.join(here, "admin-mock.js"), path.join(work, "src", "mock.js"));
  // The mock goes in before the app; the logo path follows the demo's base.
  const main = path.join(work, "src", "main.jsx");
  fs.writeFileSync(main, "import './mock.js';\n" + fs.readFileSync(main, "utf8"));
  const shell = path.join(work, "src", "App.jsx");
  fs.writeFileSync(shell, fs.readFileSync(shell, "utf8").replace('src="/icon.png"', "src={import.meta.env.BASE_URL + 'icon.png'}"));
  const out = path.join(site, "public", "demo", "admin");
  fs.rmSync(out, { recursive: true, force: true });
  execSync(`npx vite build --base /demo/admin/ --outDir ${JSON.stringify(out)} --emptyOutDir`, { cwd: work, stdio: "inherit" });
  fs.rmSync(work, { recursive: true, force: true });
  console.log("✓ public/demo/admin");
}
