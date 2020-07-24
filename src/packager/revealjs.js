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
    center: false,
    transition: 'slide', // none/fade/slide/convex/concave/zoom
    width: 1400,
    height: 900,
    slideNumber: true,
    controls: "edges",
    theme: "simple",
    pdfSeparateFragments: false
};

module.exports = function (mdtk, body) {

    debug(REVEALJS_PATH);

    const options = mdtk.options;
    const opts = Object.assign({}, REVEALJS_DEFAULTS, options.revealjs);
    const revealjs = mdtk.dependencyManager.root(REVEALJS_PATH, "revealjs");

    revealjs("plugin/notes/notes.html");

    return `
    <html lang="${options.lang || "en-US"}">
        <head>
            <title>${options.title || "MDTK Document"}</title>

            <meta charset="UTF-8">
            <meta name="generator" content="mdtk">
            <meta name="packager" content="mdtk-revealjs">
            <meta name="revealjs-version" content="${REVEALJS_VERSION}">
            <link rel="stylesheet" media="screen" href="${revealjs("css/reveal.css").href}">
            <link rel="stylesheet" media="print" href="${revealjs("css/print/pdf.css").href}">
            <link rel="stylesheet" href="${revealjs("css/theme/" + opts.theme + ".css").href}">
            <link rel="stylesheet" href="${revealjs("lib/css/zenburn.css").href}">
        </head>
        <body>
            <div class="reveal">
                <div class="slides">
                    ${body}
                </div>
            </div>

            <script src="${revealjs("lib/js/classList.js").href}"></script>
            <script src="${revealjs("lib/js/head.min.js").href}"></script>
            <script src="${revealjs("js/reveal.js").href}"></script>

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
                    border-bottom: 0.5px solid grey;
                }
                .reveal.overview #section-header,
                .reveal #section-header:empty {
                    opacity: 0;
                }
            </style>

            <script>
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
                    try {
                        var sectionTitle = Reveal.getCurrentSlide().getAttribute("data-header");
                        sectionHeader.innerText = sectionTitle;
                    } catch (e) {
                        console.error(e);
                    }
                }

                Reveal.addEventListener('slidechanged', updateSectionHeader);
                Reveal.addEventListener('ready', updateSectionHeader);

                /* Autoplay videos in fragments */
                Reveal.addEventListener( 'fragmentshown', function( event ) {
                    var video = event.fragment.querySelector( 'video' );
                     if( video ) {
                        video.play();
                    }
                  } );
                Reveal.addEventListener( 'fragmenthidden', function( event ) {
                    var audio = event.fragment.querySelector( 'video' );
                        if( video ) {
                        video.pause();
                    }
                } );

            </script>
            <script src="${revealjs("plugin/zoom-js/zoom.js").href}"></script>
            <script src="${revealjs("plugin/notes/notes.js").href}"></script>

        </body>
    </html>
    `;
};
