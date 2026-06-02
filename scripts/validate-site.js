const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const htmlFiles = [
  "index.html",
  "assets/about.html",
  "assets/services.html",
  "assets/portfolio.html",
  "assets/consultation.html",
];

const errors = [];

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const getAttributes = (html, attribute) => {
  const matches = [];
  const regex = new RegExp(`${attribute}=["']([^"']+)["']`, "gi");
  let match;

  while ((match = regex.exec(html))) {
    matches.push(match[1]);
  }

  return matches;
};

const normalize = (fromFile, reference) => {
  const cleanReference = reference.split("#")[0].split("?")[0];

  if (
    !cleanReference ||
    cleanReference.startsWith("http") ||
    cleanReference.startsWith("mailto:") ||
    cleanReference.startsWith("tel:") ||
    cleanReference.startsWith("/")
  ) {
    return null;
  }

  return path
    .normalize(path.join(path.dirname(fromFile), cleanReference))
    .replace(/\\/g, "/");
};

htmlFiles.forEach((file) => {
  if (!exists(file)) {
    errors.push(`Missing HTML file: ${file}`);
    return;
  }

  const html = fs.readFileSync(path.join(root, file), "utf8");
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]));

  [...getAttributes(html, "href"), ...getAttributes(html, "src")].forEach((reference) => {
    if (reference.startsWith("#") && reference !== "#") {
      const id = reference.slice(1);
      if (!ids.has(id)) {
        errors.push(`${file}: missing in-page target ${reference}`);
      }
      return;
    }

    const target = normalize(file, reference);
    if (target && !exists(target)) {
      errors.push(`${file}: missing asset/link target ${reference} -> ${target}`);
    }
  });

  getAttributes(html, "alt").forEach((alt, index) => {
    if (!alt.trim()) {
      errors.push(`${file}: image alt text ${index + 1} is empty`);
    }
  });
});

["styles.css", "script.js", "config.js", "netlify/functions/consultation.js", "netlify.toml", ".env.example"].forEach((file) => {
  if (!exists(file)) {
    errors.push(`Missing required production file: ${file}`);
  }
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Site validation passed.");
