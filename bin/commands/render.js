"use strict";

const debug = require("debug")("mdtk-cli/render");
const MDTK = require("../../src/mdtk");

exports.command = "render [input]";

// $0 makes render the "default command"
exports.aliases = ["$0"];

exports.describe = "renders the given input markdown as HTML";

exports.builder = function (yargs) {
    yargs
        .option("output", {
            group: "Output",
            default: "-",
            // don't normalize now because the default is "-" (stdout)
            normalize: false,
            description: "output html"
        })
        .option("packager", {
            group: "Output",
            default: "null",
            description: "type of document"
        })
        .positional("input", {
            group: "Input",
            default: "-",
            type: "string",
            // don't normalize now because the default is "-" (stdin)
            normalize: false,
            description: "input markdown"
        });
    return yargs;
};

exports.handler = async function (argv) {
    debug("%O", argv);

    try {
        const mdtk = new MDTK(argv);
        const tokens = await mdtk.tokenize();
        const html = await mdtk.render(tokens);
        await mdtk.package(html);
    } catch (error) {
        debug(error);
        process.stderr.write(`${error.message}\n`);
    }
};

