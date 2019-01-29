# MarkDown ToolKit (mdtk)

<!--ts-->
   * [MarkDown ToolKit (mdtk)](#markdown-toolkit-mdtk)
      * [Overview](#overview)
      * [Requirements](#requirements)
      * [Usage](#usage)
         * [Install](#install)
         * [Command Line](#command-line)
         * [Configuration](#configuration)
      * [Markdown](#markdown)
         * [Variable interpolation](#variable-interpolation)
         * [at-rules](#at-rules)
         * [Implicit nesting](#implicit-nesting)
         * [Explicit nesting](#explicit-nesting)
         * [Code Fences](#code-fences)
         * [Plant UML](#plant-uml)
         * [Vega Visualizations](#vega-visualizations)
         * [Speaker Notes](#speaker-notes)
         * [Table of Contents](#table-of-contents)
      * [Packagers](#packagers)
      * [Best Practices](#best-practices)
      * [TODO](#todo)
      * [Troubleshooting](#troubleshooting)
      * [Contributors](#contributors)

<!-- Added by: ahogg, at:  -->

<!--te-->

## Overview

A Markdown processor that features carefully designed syntax extensions to simplify
the creation and maintenance of composable documents.

It supports:

- CommonMark syntax
- including markdown fragments from other files
- variable interpolation (templates)
- document structure
- containers
- adding attributes and classes to elements
- syntax highlighting
- vega visualizations
- plantum diagrams

A complete document is built using a packager, among which `revealjs` and `typora`.

## Requirements

NodeJS 8.12 is tested.
It is not built for the browser and support for this is not planned for now.

## Usage

### Install

```
npm install -g mdtk
```

### Command Line

Show inline documentation:

```
mdtk --help
```

Simple example:

```
mdtk in.md > out.html
# Or using pipes
mdtk < in.md > out.html
```

Create a presentation:

```
mdtk --packager revealjs --output output/index.html content/index.md
```

Most projects will eventually prefer setting all parameters in a configuration file:

```yaml
packager: revealjs
input: content/index.md
output: output/index.html
```

```
mdtk --config config.yaml
```

`mdtk` supports a number of invocation methods, please refer to `mdtk --help`.

### Configuration

`mdtk` can be configured via the command line or a configuration file (referenced
using `--config`).

The structure of the configuration file mirrors the command line arguments nearly exactly.

It can be formatted as JSON, YAML or HCL.

Any option defined on the command line wll override the value defined in the configuration
file, *even if the option is repeatable*.

> You can view the configuration being applied by setting the environment variable `DEBUG=*`.

## Markdown

`mdtk` implements CommonMark (via markdown-it), with some extensions.

### Variable interpolation

`mdtk` passes through a template engine to interpolate variables.

Variables can be provided in different ways:

- via the command line (`--vars`)

```
mdtk render --vars.presenter.name John <<EOF
My name is {{ presenter.name }}
EOF
```

- using varfiles (`--varfiles`)

```
cat <<EOF > vars.json
{
    "presenter": {
        "name": "John"
    }
}
EOF

mdtk render --varfiles vars.json <<EOF
My name is {{ presenter.name }}
EOF
```

Just like the configuration file, varfiles can be provided as JSON, YAML or HCL.

- using corresponding properties in the configuration file

```yaml
vars:
    foo:
        baz: bar
        biz: laz
varfiles:
    - vars.json
```

### at-rules

`at-rules` are a series of syntax extension that follow the same generic format:

`@rule-name(arg1, ...argN)`

They can span multiple lines. If passing a value containing a comma or a closing parenthesis is required, the value may be enclosed in double quotes (`"`). Alternatively, any character may be quoted using a "\\".

- `@meta(name, content)`

Inserts a `<meta>` tag with the specified name and content.

- `@include(path/to/file.md)`

Inserts the contents of the given file in place. The path can be absolute or relative.
If it is relative, it will be resolved relative to the including fragment, or to the
`--include` arguments. The path can include interpolated variables, e.g. `@include(path/to/{{ master }})`.

- `@css(path/to/file.css)`

Inserts a `<link rel="stylesheet">` tag. The CSS file is resolved using exactly the same
logic as described in `@include`.

> - If the CSS file references external assets using `url(path/to/something)`, the assets
>   will be resolved 

- `@js(path/to/file.js)`

Inserts a `<script>` tag. The JS file is resolved using exactly the same logic as described
in `@include`.

- `@section(name, value)`

Sets an HTML attribute on the current `section` tag. This only makes sense when using the
nesting syntax.

### Implicit nesting

`mdtk` replaces the classic `hr` rules with nesting logic.

The following markdown:

```
Section 1

---

Section 2.a

===

Section 2.b.a

|||

Section 2.b.b

---

Section 3
```

Produces the following HTML:

```
<section>
    Section 1
</section>
<section>
    <section>
        Section 2.a
    </section>
    <section>
        <section>
            Section 2.b.a
        </section>
        <section>
            Section 2.b.b
        </section>
    </section>
</section>
<section>
    Section 3    
</section>
```

### Explicit nesting

Implicit nesting is very useful for expressing document flow, but layout requirements
are best served by an explicit approach.

```
+columns

- eenie
- meenie
- ...

-columns
```

Will render to:

```
<div class="columns">
    <ul>
        <li>eenie</li>
        <li>meenie</li>
        <li>...</li>
    </ul>
</div>
```

An empty line MUST separate the opening/closing markup from the contents.

> - Containers can be nested
> - Indenting the contents of a container is not supported

### Code Fences

Syntax highlighting is performed using `highlight.js`.

### Plant UML

Generating plantuml diagrams is supported using `markdown-it-plantuml`.

```
@startuml
...
@enduml
```

### Vega Visualizations

You can embed `vega`/`vega-lite` visualizations into your documents:

```
@startvega
...
@endvega

@startvegalite
...
@endvegalite
```

If your `spec` references a data url, `mdtk` will resolve it using the same
rules as the `@include` [at-rule](#at-rules).

> Local data files will NOT be copied to the output directory (for now), because
> rendering is done offline and the SVG output is directly embedded in the final
> HTML document.
> I can see two good reasons for including the data in the output directory like
> all other assets:
> - to support online rendering (with `vega` signals etc...)
> - to support adding a "Download data" link to the SVG caption

### Speaker Notes

Speaker Notes can be defined using explicit nesting and `notes` class name. Example use:

```
+notes

Speaker notes go here. You can use markdown syntax:

* item 1
* item 2

-notes
```

### Table of Contents

You can add `[[toc]]` where you want the table of contents to be added in your markdown. Example use:

```
# Heading
 
[[toc]]
 
## Sub heading 1
Some nice text
 
## Sub heading 2
Some even nicer text
```

> Table of Contents works with any packager, however you may want to use it with `typora` in linear documents.

## Packagers

`mdtk` performs two main tasks:

- process input markdown
- package it into a full document template

Currently `mdtk` supports three packagers:

- `null` (default)

`mdtk` will not do any packaging and will write the HTML generated from the markdown without
wrapping it in a document template.

- `revealjs`: for presentations

`mdtk` will package the generated HTML into a RevealJS presentation.

- `typora`: to generate linear documents

`mdtk` will package the generated HTML into a linear document suitable for handbooks. This packager
is called `typora` because it is inspired by the tool with the same name and steals the CSS from its
themes, this does not imply compatibility with typora markdown.

More details will be added as this feature stabilizes.

## Best Practices

- Use fragment-relative paths for local assets
- Use include-relative paths for shared assets
- Avoid paths containing `../`-style components
- Use your editor's automatic file saving in combination with `--serve`
  for a nice live-reload experience

## TODO

- [ ] `@css`: resolve `@import`
- [x] `@xxx`: better argument parsing (allow commas)
- [ ] `tests`: fix the tests and improve coverage
- [ ] `packager`: make the highlight.js theme configurable
- [ ] `ext`: local plantuml server
- [x] `ext`: vega & vega-lite
- [ ] `documentation`: create guides for authoring different doc types
- [ ] `documentation`: improve the theme of the example
- [ ] `documentation`: include examples for each packager

And many more things.

## Troubleshooting

- `npm install` error output when building `canvas` module

`node-gyp` expects python 2. If python 3 is your default version, you can run:

```bash
npm install --python=python2.7 mdtk
```

## Contributors

* Anthony Hogg / @ynohat
* Łukasz Czerpak / @lukaszczerpak
