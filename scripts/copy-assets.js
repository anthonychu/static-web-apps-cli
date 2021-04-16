const path = require("path");
const fs = require("fs");
const child_process = require("child_process");
const branch = child_process.execSync(`git rev-parse --abbrev-ref HEAD`).toString("utf-8").trim();
const hash = child_process.execSync(`git rev-parse --short HEAD`).toString("utf-8").trim();
const build = `<a rel="noopener noreferrer" target="_blank" href="https://github.com/Azure/static-web-apps-cli/commit/${hash}">${branch}+sha.${hash}</a>`;
const fse = require("fs-extra");

// main
(function () {
  // prettier-ignore
  const files = [
    path.join("src", "public", "auth.html"),
    path.join("src", "public", "unauthorized.html"),
    path.join("src", "public", "404.html"),
    path.join("src", "cli", "bin.js"),
  ];

  files.forEach((file) => {
    let distFile = file.replace("src", "dist");

    if (!fs.existsSync(path.dirname(distFile))) {
      fs.mkdirSync(path.dirname(distFile), { recursive: true });
    }

    fs.copyFileSync(file, distFile);

    let content = fs.readFileSync(distFile).toString('utf-8');
    content = content.replace(/#STAMP#/, build);
    fs.writeFileSync(distFile, content);
  });

  fse.copySync(path.resolve(__dirname, "../src/templates"), path.resolve(__dirname, "../dist/templates"));
})();
