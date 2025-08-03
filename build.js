const fs = require('fs');
const path = require('path');
const Terser = require('terser');
const CleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier');

// Source folders
const ROOT = path.resolve('.');
const ASSETS = path.join(ROOT, 'assets');
const JS_SRC = path.join(ASSETS, 'js');
const CSS_SRC = path.join(ASSETS, 'css');
const SAMPLE_SRC = path.join(ASSETS, 'sample');

// Build output folder
const BUILD = path.join(ROOT, 'build');
const JS_BUILD = path.join(BUILD, 'js');
const CSS_BUILD = path.join(BUILD, 'css');
const SAMPLE_BUILD = path.join(BUILD, 'sample');

// Utility: clean and create folder
function cleanFolder(folder) {
  if (fs.existsSync(folder)) {
    fs.rmSync(folder, { recursive: true, force: true });
  }
  fs.mkdirSync(folder, { recursive: true });
}

// Utility: copy folder recursively (for sample folder)
function copyFolder(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      copyFolder(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

(async () => {
  try {
    console.log('🧹 Cleaning build folder...');
    cleanFolder(BUILD);
    fs.mkdirSync(JS_BUILD);
    fs.mkdirSync(CSS_BUILD);

    // ----- JS MINIFY -----
    console.log('🛠️ Minifying JS files...');
    const jsFiles = fs.readdirSync(JS_SRC).filter(f => f.endsWith('.js'));
    for (const file of jsFiles) {
      const filePath = path.join(JS_SRC, file);
      const code = fs.readFileSync(filePath, 'utf-8');
      const minified = await Terser.minify(code);
      if (minified.error) {
        console.error(`❌ Error minifying ${file}:`, minified.error);
        continue;
      }
      const outPath = path.join(JS_BUILD, file.replace('.js', '.min.js'));
      fs.writeFileSync(outPath, minified.code, 'utf-8');
      console.log(`✅ Minified JS: ${file} → ${path.relative(ROOT, outPath)}`);
    }

    // ----- CSS MINIFY -----
    console.log('🎨 Minifying CSS files...');
    const cssFiles = fs.readdirSync(CSS_SRC).filter(f => f.endsWith('.css'));
    for (const file of cssFiles) {
      const filePath = path.join(CSS_SRC, file);
      const css = fs.readFileSync(filePath, 'utf-8');
      const output = new CleanCSS().minify(css);
      if (output.errors.length) {
        console.error(`❌ CSS minify errors in ${file}:`, output.errors);
        continue;
      }
      const outPath = path.join(CSS_BUILD, file.replace('.css', '.min.css'));
      fs.writeFileSync(outPath, output.styles, 'utf-8');
      console.log(`✅ Minified CSS: ${file} → ${path.relative(ROOT, outPath)}`);
    }

    // ----- HTML MINIFY -----
    console.log('📝 Minifying HTML files...');
    // Find all .html files in root (not recursive)
    const htmlFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.html'));
    for (const file of htmlFiles) {
      const filePath = path.join(ROOT, file);
      let html = fs.readFileSync(filePath, 'utf-8');

      // Adjust relative asset paths in HTML
      // Change: src="assets/js/xxx.js" => src="js/xxx.min.js"
      // Change: href="assets/css/xxx.css" => href="css/xxx.min.css"
      html = html.replace(/src="assets\/js\/(.*?)\.js"/g, (m, p1) => {
        return `src="js/${p1}.min.js"`;
      });
      html = html.replace(/href="assets\/css\/(.*?)\.css"/g, (m, p1) => {
        return `href="css/${p1}.min.css"`;
      });

      // Minify HTML
      const minified = htmlMinifier.minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
      });

      const outPath = path.join(BUILD, file);
      fs.writeFileSync(outPath, minified, 'utf-8');
      console.log(`✅ Minified HTML: ${file} → ${path.relative(ROOT, outPath)}`);
    }

    // ----- COPY SAMPLE FOLDER -----
    console.log('📦 Copying sample folder...');
    if (fs.existsSync(SAMPLE_SRC)) {
      copyFolder(SAMPLE_SRC, SAMPLE_BUILD);
      console.log(`✅ Copied sample folder → ${path.relative(ROOT, SAMPLE_BUILD)}`);
    } else {
      console.log('⚠️ Sample folder not found, skipping copy.');
    }

    console.log('🎉 Build complete!');
  } catch (err) {
    console.error('❌ Build failed:', err);
  }
})();
