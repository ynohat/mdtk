"use strict";

const debug = require("debug")("mdtk/packager/typora");

const path = require("path");
const fs = require("fs");

const TYPORA_PATH = path.join(
    __dirname,
    "typora",
    "themes"
);

const TYPORA_DEFAULTS = {
    theme: "pixyll"
};

module.exports = function (mdtk, body) {
    debug(TYPORA_PATH);

    const options = mdtk.options;
    const opts = Object.assign({}, TYPORA_DEFAULTS, options.typora);
    const typora = mdtk.dependencyManager.root(TYPORA_PATH, "typora");

    var assetsDir = path.join(TYPORA_PATH, opts.theme);
    debug("assetsDir: %s", assetsDir);
    if (fs.existsSync(assetsDir)) {
        fs.readdirSync(assetsDir).forEach(f => {
            typora(`${opts.theme}/${f}`);
        });
    }

    return `
    <html lang="${options.lang || "en-US"}">
        <head>
            <title>${options.title || "MDTK Document"}</title>

            <meta charset="UTF-8">
            <meta name="generator" content="mdtk">
            <meta name="packager" content="mdtk-typora">
            <link rel="stylesheet" href="${typora(opts.theme+".css").href}">
        </head>
        <body class="typora-export">
         <div  id="write">${body}</div>
        </body>
    </html>
    `;
};
