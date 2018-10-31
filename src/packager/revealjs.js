"use strict";

const debug = require("debug")("mdtk/packager/revealjs");

const path = require("path");

const REVEALJS_VERSION = "3.7.0";
const REVEALJS_PATH = path.join(
    __dirname,
    `reveal.js-${REVEALJS_VERSION}`
);
const REVEALJS_DEFAULTS = {
    controls: true,
    progress: true,
    history: true,
    center: true,
    transition: 'slide', // none/fade/slide/convex/concave/zoom
    width: 1400,
    height: 900,
    slideNumber: true,
    controls: "edges"
};

module.exports = function (body, deps, options) {

    debug(REVEALJS_PATH);

    const opts = Object.assign({}, REVEALJS_DEFAULTS, options.revealjs);
    const revealjs = deps.root(REVEALJS_PATH, "revealjs");

    revealjs("plugin/notes/notes.html");

    return `
    <html lang="${options.lang || "en-US"}">
        <head>
            <title>${options.title || "MDTK Document"}</title>

            <meta name="generator" content="mdtk">
            <meta name="packager" content="mdtk-revealjs">
            <meta name="revealjs-version" content="${REVEALJS_VERSION}">
            <link rel="stylesheet" href="${revealjs("css/reveal.css")}">
            <link rel="stylesheet" href="${revealjs("css/theme/simple.css")}">
            <link rel="stylesheet" href="${revealjs("lib/css/zenburn.css")}">
        </head>
        <body>
            ${body}

            <script src="${revealjs("lib/js/classList.js")}"></script>
            <script src="${revealjs("lib/js/head.min.js")}"></script>
            <script src="${revealjs("js/reveal.js")}"></script>

            <style>
                /**
                 * Slide section header
                 */
                .reveal #section-header {
                    -webkit-transform-style: flat;
                    transform-style: flat;
                    transition: -webkit-transform-origin 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985), -webkit-transform 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985), visibility 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985), opacity 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985);
                    transition: transform-origin 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985), transform 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985), visibility 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985), opacity 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985), height 800ms cubic-bezier(0.26, 0.86, 0.44, 0.985);
                }
                .reveal:not(.overview) #section-header {
                    position: absolute;
                    display: block;
                    box-sizing: border-box;
                    top: 0px;
                    left: 32px;
                    right: 32px;
                
                    text-align: center;
                    content: attr(data-section);
                    font-size: 0.7em;
                    padding: 5px 10px;
                    border-bottom: 0.5px solid #fffc;
                }
                .reveal.overview #section-header,
                .reveal #section-header:empty {
                    opacity: 0;
                }
            </style>

            <script>
                document.querySelector("body").classList.add("reveal");
                document.querySelector("body > section:first-child").classList.add("slides");
                Reveal.initialize(${JSON.stringify(opts)});

                var sectionHeader = document.createElement("header");
                sectionHeader.id = "section-header";
                document.querySelector(".reveal")
                    .appendChild(sectionHeader);

                var currentSection = null;
                Array.from(document.querySelectorAll(".slides section"))
                    .forEach(section => {
                        var h1 = section.querySelector("h1");
                        if (h1) {
                            currentSection = h1.innerText;
                            section.setAttribute("data-header", "");
                        } else if (currentSection) {
                            section.setAttribute("data-header", currentSection);
                        }
                    })

                function updateSectionHeader() {
                    var sectionTitle = Reveal.getCurrentSlide().getAttribute("data-header");
                    sectionHeader.innerText = sectionTitle;
                }

                Reveal.addEventListener('slidechanged', updateSectionHeader);
                Reveal.addEventListener('ready', updateSectionHeader);
            </script>
            <script src="${revealjs("plugin/zoom-js/zoom.js")}"></script>
            <script src="${revealjs("plugin/notes/notes.js")}"></script>

        </body>
    </html>
    `;
};
