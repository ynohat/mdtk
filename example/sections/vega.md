# Vega & Vega Lite

===

## Vega Lite

@startvegalite
{
    "width": 500,
    "height": 160,
    "description": "A simple bar chart with embedded data.",
    "data": {
        "values": [
            {"a": "A","b": 50}, {"a": "B","b": 55}, {"a": "C","b": 43},
            {"a": "D","b": 91}, {"a": "E","b": 81}, {"a": "F","b": 53},
            {"a": "G","b": 19}, {"a": "H","b": 87}, {"a": "I","b": 52}
        ]
    },
    "mark": "bar",
    "encoding": {
        "x": {"field": "a", "type": "ordinal"},
        "y": {"field": "b", "type": "quantitative"}
    }
}
@endvegalite

===

## Vega

@startvega
{
  "width": 500,
  "height": 160,
  "padding": 5,

  "config": {
    "axisBand": {
      "bandPosition": 1,
      "tickExtra": true,
      "tickOffset": 0
    }
  },

  "signals": [
    {
      "name": "errorMeasure", "value": "95% Confidence Interval",
      "bind": {"input": "select", "options": [
        "95% Confidence Interval",
        "Standard Error",
        "Standard Deviation",
        "Interquartile Range"
      ]}
    },
    {
      "name": "lookup",
      "value": {
        "95% Confidence Interval": "ci",
        "Standard Deviation": "stdev",
        "Standard Error": "stderr",
        "Interquartile Range": "iqr"
      }
    },
    {
      "name": "measure",
      "update": "lookup[errorMeasure]"
    }
  ],

  "data": [
    {
      "name": "barley",
      "url": "data/barley.json"
    },
    {
      "name": "summary",
      "source": "barley",
      "transform": [
        {
          "type": "aggregate",
          "groupby": ["variety"],
          "fields": ["yield", "yield", "yield", "yield", "yield", "yield", "yield"],
          "ops": ["mean", "stdev", "stderr", "ci0", "ci1", "q1", "q3"],
          "as": ["mean", "stdev", "stderr", "ci0", "ci1", "iqr0", "iqr1"]
        },
        {
          "type": "formula", "as": "stdev0",
          "expr": "datum.mean - datum.stdev"
        },
        {
          "type": "formula", "as": "stdev1",
          "expr": "datum.mean + datum.stdev"
        },
        {
          "type": "formula", "as": "stderr0",
          "expr": "datum.mean - datum.stderr"
        },
        {
          "type": "formula", "as": "stderr1",
          "expr": "datum.mean + datum.stderr"
        }
      ]
    }
  ],

  "scales": [
    {
      "name": "yscale",
      "type": "band",
      "range": "height",
      "domain": {
        "data": "summary",
        "field": "variety",
        "sort": {"op": "max", "field": "mean", "order": "descending"}
      }
    },
    {
      "name": "xscale",
      "type": "linear",
      "range": "width", "round": true,
      "domain": {"data": "summary", "fields": ["stdev0", "stdev1"]},
      "zero": false, "nice": true
    }
  ],

  "axes": [
    {"orient": "bottom", "scale": "xscale", "zindex": 1, "title": "Barley Yield"},
    {"orient": "left", "scale": "yscale", "tickCount": 5, "zindex": 1}
  ],

  "marks": [
    {
      "type": "rect",
      "from": {"data": "summary"},
      "encode": {
        "enter": {
          "fill": {"value": "black"},
          "height": {"value": 1}
        },
        "update": {
          "y": {"scale": "yscale", "field": "variety", "band": 0.5},
          "x": {"scale": "xscale", "signal": "datum[measure+'0']"},
          "x2": {"scale": "xscale", "signal": "datum[measure+'1']"}
        }
      }
    },
    {
      "type": "symbol",
      "from": {"data": "summary"},
      "encode": {
        "enter": {
          "fill": {"value": "black"},
          "size": {"value": 40}
        },
        "update": {
          "x": {"scale": "xscale", "field": "mean"},
          "y": {"scale": "yscale", "field": "variety", "band": 0.5}
        }
      }
    }
  ]
}
@endvega