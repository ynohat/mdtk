"use strict";

const debug = require("debug")("mdtk-cli/bootstrap");
const mkdirp = require("mkdirp");
const path = require("path");
const os = require("os");
const fs = require("fs");
const yaml = require("node-yaml");

exports.command = "bootstrap <dir>";

exports.describe = "bootstrap a new mdtk project directory";

exports.builder = function (yargs) {
    yargs
        .positional("dir", {
            group: "General",
            normalize: true,
            description: "target directory, will be created if necessary",
            demandOption: true
        })
        .option("force", {
            group: "General",
            default: false,
            description: "create and overwrite even if dir or contents exist"
        })
        .option("packager", {
            group: "Output",
            default: "revealjs",
            description: "type of document"
        });
    return yargs;
};

exports.handler = async function (argv) {
    debug("%O", argv);

    try {
        if (!argv.force && fs.existsSync(argv.dir)) {
            throw new Error(`${argv.dir} exists, use --force to bootstrap anyway`);
        }


        const opts = JSON.parse(JSON.stringify(argv));
        delete opts._;
        delete opts.force;
        delete opts.dir;
        delete opts["$0"];

        opts.include = ["./content"];
        opts.input = "./content/index.md";
        opts.output = "./output/index.html";

        mkdirp.sync(argv.dir);
        mkdirp.sync(path.join(argv.dir, "content"));
        mkdirp.sync(path.join(argv.dir, "output"));

        fs.writeFileSync(path.join(argv.dir, "mdtk.yaml"), yaml.dump(opts));

        fs.writeFileSync(path.join(argv.dir, "content", "index.md"), [
            "@css(style.css)",
            "",
            "# Hello, MDTK!",
            ""
        ].join(os.EOL));

        fs.writeFileSync(path.join(argv.dir, "content", "style.css"), "");

        fs.writeFileSync(path.join(argv.dir, ".gitignore"), [
            "output/*"
        ].join(os.EOL));

        console.log(`Render using:`);
        console.log(`    mdtk render --config ${path.join(argv.dir, "mdtk.yaml")}`);
        console.log(`Or edit with live reload using:`);
        console.log(`    mdtk serve --config ${path.join(argv.dir, "mdtk.yaml")}`);
    } catch (error) {
        debug(error);
        process.stderr.write(`${error.message}\n`);
    }
};

