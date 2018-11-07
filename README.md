# MarkDown ToolKit (mdtk)

## Table of Contents

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
* [Packagers](#packagers)
* [Best Practices](#best-practices)
* [TODO](#todo)

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

```
mdtk --help
mdtk render --config mdtk.yaml
mdtk render --output output/index.html content/index.md
```

`mdtk` supports a number of invocation methods, please refer to `mdtk --help`.

### Configuration

`mdtk` can be configured via the command line or a configuration file (referenced
using `--config`).

The structure of the configuration file mirrors the command line arguments exactly.

It can be formatted as JSON, YAML or HCL.

Any option defined on the command line wll override the value defined in the configuration
file, *even if the option is repeatable*.

> You can view the configuration being applied by setting the environment variable `DEBUG=*`.

## Markdown

`mdtk` implements CommonMark (via markdown-it), with some extensions.

### Variable interpolation

`mdtk` passes through a template engine to interpolate variables.

Variables can be provided in different ways:

- configuration file

```yaml
vars:
    foo:
        baz: bar
        biz: laz
```

- command line (`--vars`)

```
mdtk render --vars.presenter.name John <<EOF
My name is {{ presenter.name }}
EOF
```

- varfiles

Variables can be defined in separate files.

### at-rules

- `@meta(name, content)`

Inserts a `<meta>` tag with the specified name and content.

> A current limitation is that the name and content MUST NOT contain commas, because
> of the rudimentary parsing logic for the at-rule parameters.

- `@include(path/to/file.md)`

Inserts the contents of the given file in place. The path can be absolute or relative.
If it is relative, it will be resolved relative to the including fragment, or to the
`--include` arguments.

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

## Packagers

`mdtk` performs two main tasks:

- process input markdown
- package it into a full document template

Currently `mdtk` supports two packagers:

- `revealjs`: for presentations
- `typora`: to generate linear documents

More details will be added as this feature stabilizes.

## Best Practices

- Use fragment-relative paths for local assets
- Use include-relative paths for shared assets
- Avoid paths containing `../`-style components
- Use your editor's automatic file saving in combination with `--serve`
  for a nice live-reload experience

## TODO

[ ] `@css`: resolve `@import`
[ ] `@xxx`: better argument parsing (allow commas)
[ ] `tests`: fix the tests and improve coverage
[ ] `packager`: make the highlight.js theme configurable
[ ] `fences`: local plantuml server
[ ] `fences`: vega & vega-lite
[ ] `documentation`: create guides for authoring different doc types
[ ] `documentation`: improve the theme of the example
[ ] `documentation`: include examples for each packager

And many more things.