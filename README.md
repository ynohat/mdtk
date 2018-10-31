# MarkDown ToolKit (mdtk)

A Markdown processor that features carefully designed syntax extensions to simplify
the creation and maintenance of composable documents.

It supports:

- CommonMark syntax
- including markdown fragments from other files
- variable interpolation (templates)
- nesting without block notation
- containers
- adding attributes and classes to elements
- syntax highlighting

## Requirements

NodeJS 8.12 is tested.
It is not built for the browser but support may be added at a later stage.

## Syntax

### Markdown

`mdtk` implements 

## Usage

### Install

```
npm install mdtk
```

### Command Line

```
mdtk < input.md > output.html
```

## Microdata

Using "Creative Work" vocabulary (https://schema.org/CreativeWork).

```
@microdata("author", "Anthony Hogg")
@microdata("sourceOrganization", "Akamai Technologies")
@microdata("author", "Anthony Hogg")
```
