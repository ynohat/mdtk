"use strict";

const debug = require("debug")("mdtk/packager");

/**
 * `./processor.js` is used to generate the body of the document;
 *
 * The packager wraps the output and generates a complete HTML
 * document, unless no packager is specified, in which case the
 * HTML is returned unchanged.
 */
exports.package = function (html, deps, options) {
    if (!options.packager) {
        debug("no packager specified");
        return {
            html: html,
            deps: []
        };
    }

    const packagerPath = require.resolve(`./packager/${options.packager}`);
    if (!packagerPath) {
        debug("packager %s not found", options.packager);
        throw new Exception("Unknown packager");
    }

    const actualPackager = require(packagerPath);
    const packagedHtml = actualPackager(html, deps, options);
    return {
        html: packagedHtml,
        deps: deps.deps
    };
}

exports.write = function (pkg, options) {
    const path = require("path");
    const fs = require("fs");
    const mkdirp = require("mkdirp");

    var output = process.stdout;
    var outputDir = process.cwd();
    if (options.output !== "-") {
        outputDir = path.dirname(options.output);
        mkdirp.sync(outputDir);

        mkdirp.sync(path.dirname(options.output));
        output = fs.createWriteStream(options.output, "utf8");
    }

    output.write(pkg.html);

    // don't create output dir if we're piping to stdout
    if (options.output !== "-") {
        (pkg.deps || []).forEach(dep => {
            const destPath = path.join(outputDir, dep.ref);
            mkdirp.sync(path.dirname(destPath));
            debug("copying %s -> %s (satisfying %s)", dep.src, destPath, dep.ref);
            fs.copyFileSync(dep.src, destPath);
        });
    }
}

exports.list = function () {
    const fs = require("fs");
    const pat = /^(.+)\.js$/;
    return fs.readdirSync(require.resolve("./packager"))
        .filter(name => pat.test(name))
        .map(name => name.match(pat)[1]);
}
