"use strict";

const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const debug = require("debug")("mdtk/packager");

class Packager {
    constructor(mdtk) {
        this.mdtk = mdtk;
    }

    getConcretePackager() {
        var options = this.mdtk.options;
        if (!options.packager) {
            debug("no packager specified");
            return {
                html: html,
                deps: []
            };
        }

        const packagerPath = require.resolve(`./${options.packager}`);
        if (!packagerPath) {
            debug("packager %s not found", options.packager);
            throw new Error("Unknown packager");
        }

        return require(packagerPath);
    }

    async write(html) {
        debug("write", this.mdtk.options.packager, this.mdtk.options.output);
        var concretePackager = this.getConcretePackager();
        html = concretePackager(this.mdtk, html);

        const options = this.mdtk.options;
        var output = process.stdout;
        var outputDir = process.cwd();
        if (options.output !== "-") {
            outputDir = path.dirname(options.output);
            mkdirp.sync(outputDir);
    
            mkdirp.sync(path.dirname(options.output));
            output = fs.createWriteStream(options.output, "utf8");
        }

        await new Promise((resolve, reject) => {
            output.write(html, err => {
                if (err) return reject("failed to write packaged output");
                resolve();
            });
        });
    
        // don't package dependencies if we're piping to stdout
        if (options.output !== "-") {
            this.mdtk.dependencies.forEach(dep => {
                const destPath = path.join(outputDir, dep.ref);
                mkdirp.sync(path.dirname(destPath));
                debug("copying %s -> %s (satisfying %s)", dep.src, destPath, dep.ref);
                fs.copyFileSync(dep.src, destPath);
            });
        }
    }

    list() {
        debug("list");
        const pat = /^(.+)\.js$/;
        return fs.readdirSync(require.resolve("./packager"))
            .filter(name => pat.test(name))
            .map(name => name.match(pat)[1]);
    }
}

module.exports = Packager;
