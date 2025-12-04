const fs = require('fs');
const path = require('path');

const BUILD_DIR = path.resolve(__dirname, '..', '.next');
const OUT_DIR = path.resolve(__dirname, '..', 'out');
const TARGET_WWWROOT = path.resolve(__dirname, '..', '..', 'ELTN32.client', 'wwwroot');

async function rmrf(p) {
  try { await fs.promises.rm(p, { recursive: true, force: true }); } catch(e) {}
}

async function copy() {
  // Check if 'out' exists (static export), else use .next
  const sourceDir = fs.existsSync(OUT_DIR) ? OUT_DIR : BUILD_DIR;

  if (!fs.existsSync(sourceDir)) {
    console.error('Build output not found:', sourceDir);
    console.error('Available directories:', fs.readdirSync(path.resolve(__dirname, '..')));
    process.exit(1);
  }

  console.log('Copying Next.js output...');
  console.log('  FROM:', sourceDir);
  console.log('  TO:  ', TARGET_WWWROOT);

  await rmrf(TARGET_WWWROOT);
  await fs.promises.mkdir(path.dirname(TARGET_WWWROOT), { recursive: true });

  if (fs.promises.cp) {
    await fs.promises.cp(sourceDir, TARGET_WWWROOT, { recursive: true });
  } else {
    const copyRecursive = async (src, dest) => {
      const stat = await fs.promises.stat(src);
      if (stat.isDirectory()) {
        await fs.promises.mkdir(dest, { recursive: true });
        for (const f of await fs.promises.readdir(src)) {
          await copyRecursive(path.join(src, f), path.join(dest, f));
        }
      } else {
        await fs.promises.copyFile(src, dest);
      }
    };
    await copyRecursive(sourceDir, TARGET_WWWROOT);
  }

  console.log('✓ Copied successfully!');
}

copy().catch(err => {
  console.error('Copy failed:', err);
  process.exit(1);
});