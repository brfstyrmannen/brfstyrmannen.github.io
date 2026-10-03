// Run after `bundle exec jekyll build` from the repository root.
const fs = require('node:fs');
const path = require('node:path');

const site = path.resolve(__dirname, '..', 'docs', '_site');
if (!fs.existsSync(site)) {
  console.error(`Site not built: ${site}`);
  process.exit(1);
}

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  });
}

const htmlFiles = filesIn(site).filter((file) => file.endsWith('.html'));
const ids = new Map();
const links = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  ids.set(file, new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1])));

  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(value)) continue;
    links.push({ file, value });
  }
}

const errors = [];
for (const { file, value } of links) {
  const source = path.relative(site, file);
  const base = new URL(source.split(path.sep).join('/'), 'https://site.invalid/');
  let target;
  try {
    target = new URL(value, base);
  } catch {
    errors.push(`${source}: invalid URL ${value}`);
    continue;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(target.pathname);
  } catch {
    errors.push(`${source}: invalid URL encoding ${value}`);
    continue;
  }

  const filename = path.resolve(site, `.${pathname}`);
  if (filename !== site && !filename.startsWith(site + path.sep)) {
    errors.push(`${source}: path escapes site: ${value}`);
    continue;
  }

  const candidates = pathname.endsWith('/')
    ? [path.join(filename, 'index.html')]
    : [filename, `${filename}.html`, path.join(filename, 'index.html')];
  const destination = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
  if (!destination) {
    errors.push(`${source}: missing ${value}`);
  } else if (target.hash && destination.endsWith('.html')) {
    let fragment;
    try {
      fragment = decodeURIComponent(target.hash.slice(1));
    } catch {
      errors.push(`${source}: invalid fragment ${value}`);
      continue;
    }
    if (!ids.get(destination)?.has(fragment)) errors.push(`${source}: missing fragment ${value}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Checked ${links.length} local links in ${htmlFiles.length} HTML pages.`);
}

