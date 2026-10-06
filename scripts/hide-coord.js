// Temporarily moves symlinks that escape the project root (`coord`,
// `.env.local`) out of the way during `next build`, then restores them.
// Turbopack follows symlinks and hard-fails when one points outside the
// project root. Both are gitignored so Vercel never sees them; this only
// affects local builds.
const fs = require("fs");
const os = require("os");
const path = require("path");

const LINKS = ["coord", ".env.local"];
const dir = __dirname;

function stashPath(name) {
  return path.join(os.tmpdir(), `ad-link-${name}-${process.pid}`);
}

if (process.argv[2] === "hide") {
  for (const name of LINKS) {
    const link = path.join(dir, name);
    try {
      if (fs.existsSync(link) && fs.lstatSync(link).isSymbolicLink()) {
        fs.renameSync(link, stashPath(name));
      }
    } catch { /* ignore */ }
  }
} else if (process.argv[2] === "restore") {
  for (const name of LINKS) {
    const link = path.join(dir, name);
    const stashed = stashPath(name);
    try {
      if (!fs.existsSync(link) && fs.existsSync(stashed)) fs.renameSync(stashed, link);
      else if (fs.existsSync(stashed)) fs.unlinkSync(stashed);
    } catch { /* ignore */ }
  }
}
