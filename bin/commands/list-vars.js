"use strict";

const debug = require("debug")("mdtk-cli/list-vars");

exports.command = "list-vars [input]";

exports.describe = "lists variables used in the input";

exports.builder = function (yargs) {
    yargs
        .option("format", {
            group: "Output",
            default: "json",
            choices: ["json", "yaml"],
            description: "choose output format"
        })
        .positional("input", {
            default: "-",
            type: "string",
            description: "input markdown"
        });
    return yargs;
};

exports.handler = async function (argv) {
    debug("%O", argv);

    const DependencyManager = require("../../src/dependencyManager");
    const deps = new DependencyManager();

    var {slurp} = require("../../src/utils");

    var markdown = await slurp(argv.input);
    var requestedVars = {};
    argv.vars = VarProxy(argv.vars || {}, requestedVars);
    var processor = require("../../src/processor")(argv, deps);
    processor.parse(markdown);

    if (argv.format === "json") {
        console.log(JSON.stringify(requestedVars, null, "  "));
    }
};



function VarProxy(vars, requested, ns) {
    var ns = ns || [];

    function setRequested(name, value) {
        var ctx = requested;
        for (let i = 0; i < ns.length; i++) {
            ctx = ctx[ns[i]];
        }
        if (ctx[name] === undefined) {
            ctx[name] = (value === undefined) ? null : value;
        }
    }

    return new Proxy(vars, {
        get: function (target, name, receiver) {
            var rv = target[name];

            if (typeof name !== "string") {
                return rv;
            }

            var fqn = ns.concat(name).join(".");
            debug("vars.get", fqn, typeof rv);

            if (Array.isArray(rv)) {
                setRequested(name, []);
                return VarProxy(rv, requested, ns.concat(name));
            } else if (typeof rv === "object") {
                setRequested(name, {});
                return VarProxy(rv, requested, ns.concat(name));
            } else {
                if (rv === undefined) {
                    setRequested(name, null);
                } else {
                    setRequested(name, rv);
                }
            }
            return rv;
        }
    });
}
