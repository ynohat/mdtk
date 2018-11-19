#!/usr/bin/env node

"use strict";

const debug = require("debug")("mdtk-cli");

const yargs = require("yargs");

try {
    yargs
    .showHelpOnFail(false)
        .options(require("./global"))
        .commandDir("./commands")
        .wrap(yargs.terminalWidth()) 
        .middleware([
            function consolidateVars(argv) {
                var vars = {};
                (argv.varfiles || []).reduce((vars, f) => {
                    debug("assigning --varfile", f);
                    const {parseAny} = require("../src/utils");
                    return Object.assign(vars, parseAny(f));
                }, vars);
                debug("assigning --vars", argv.vars);
                argv.vars = Object.assign(vars, argv.vars);
            }
        ])
        .parse();
} catch (error) {
    console.log(error.message);
    debug(error);
}