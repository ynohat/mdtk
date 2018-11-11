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

===

## HARrrrr

@startvega
{
  "$schema": "https://vega.github.io/schema/vega/v4.json",
  "autosize": "pad",
  "width": 800,
  "height": 600,
  "signals": [
    {
      "name": "tooltip",
      "value": {},
      "on": [
        {
          "events": "rect:mouseover",
          "update": "datum"
        },
        {
          "events": "rect:mouseout",
          "update": "{}"
        }
      ]
    },
    {
      "name": "har_url",
      "value": "https://gist.githubusercontent.com/ynohat/2eeeaf3708a47a1a5769feebe9bddfc3/raw/44a6bf22e8cc0b6087b73e127fcc66158b9f2a92/www.google.com.har"
    }
  ],
  "data": [
    {
      "name": "har_entries",
      "url": {"signal": "har_url"},
      "source": "har",
      "format": {
        "type": "json",
        "property": "log.entries",
        "parse": {
          "startedDateTime": "date"
        }
      },
      "transform": [
        {
          "type": "formula",
          "as": "domain",
          "expr": "split(datum.request.url, '/')[2]"
        },
        {
          "type": "formula",
          "as": "path",
          "expr": "replace(datum.request.url, /[^:]+:\\/\\/[^\\/]+(\\/[^?]*)/, '$1')"
        },
        {
          "type": "formula",
          "as": "file",
          "expr": "'/' + peek(split(datum.path, '/'))"
        },
        {
          "type": "formula",
          "as": "blockedEndTime",
          "expr": "time(datum.startedDateTime) + max(datum.timings.blocked, 0)"
        },
        {
          "type": "formula",
          "as": "dnsEndTime",
          "expr": "time(datum.blockedEndTime) + max(datum.timings.dns, 0)"
        },
        {
          "type": "formula",
          "as": "connectEndTime",
          "expr": "time(datum.dnsEndTime) + max(datum.timings.connect, 0)"
        },
        {
          "type": "formula",
          "as": "sslStartTime",
          "expr": "time(datum.connectEndTime) - max(datum.timings.ssl, 0)"
        },
        {
          "type": "formula",
          "as": "sslEndTime",
          "expr": "time(datum.connectEndTime)"
        },
        {
          "type": "formula",
          "as": "sendEndTime",
          "expr": "time(datum.sslEndTime) + max(datum.timings.send, 0)"
        },
        {
          "type": "formula",
          "as": "waitEndTime",
          "expr": "time(datum.sendEndTime) + max(datum.timings.wait, 0)"
        },
        {
          "type": "formula",
          "as": "receiveEndTime",
          "expr": "time(datum.waitEndTime) + max(datum.timings.receive, 0)"
        },
        {
          "type": "formula",
          "as": "endDateTime",
          "expr": "toDate(time(datum.startedDateTime) + max(datum.time, 0))"
        }
      ]
    },
    {
      "name": "har_pages",
      "url": {"signal": "har_url"},
      "source": "har",
      "format": {
        "type": "json",
        "property": "log.pages",
        "parse": {
          "startedDateTime": "date"
        }
      },
      "transform": [
        {
          "type": "formula",
          "as": "pageLoadTime",
          "expr": "time(datum.startedDateTime) + datum.pageTimings.onLoad"
        },
        {
          "type": "formula",
          "as": "dclTime",
          "expr": "time(datum.startedDateTime) + datum.pageTimings.onContentLoad"
        }
      ]
    }
  ],
  "scales": [
    {
      "name": "time",
      "type": "time",
      "range": "width",
      "domain": {
        "data": "har_entries",
        "fields": [
          "startedDateTime",
          "endDateTime"
        ]
      },
      "round": true,
      "nice": "millisecond"
    },
    {
      "name": "url",
      "type": "band",
      "domain": {
        "data": "har_entries",
        "field": "request.url"
      },
      "range": "height",
      "align": 0.5,
      "round": true
    }
  ],
  "axes": [
    {
      "orient": "bottom",
      "scale": "time",
      "tickCount": {
        "interval": "second",
        "step": 1
      },
      "format": "%S.%L"
    },
    {
      "orient": "left",
      "scale": "url",
      "labelLimit": 300
    }
  ],
  "marks": [
    {
      "type": "rect",
      "from": {
        "data": "har_entries"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "startedDateTime"
          },
          "x2": {
            "scale": "time",
            "field": "blockedEndTime"
          },
          "height": {
            "value": 0.5
          },
          "yc": {
            "scale": "url",
            "field": "request.url",
            "band": 0.5
          },
          "fill": {
            "value": "black"
          }
        },
        "update": {
          "fill": {
            "value": "black"
          }
        },
        "hover": {
          "fill": {
            "value": "red"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "har_entries"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "blockedEndTime"
          },
          "x2": {
            "scale": "time",
            "field": "dnsEndTime"
          },
          "height": {
            "value": 3
          },
          "yc": {
            "scale": "url",
            "field": "request.url",
            "band": 0.5
          },
          "fill": {
            "value": "green"
          }
        },
        "update": {
          "fill": {
            "value": "green"
          }
        },
        "hover": {
          "fill": {
            "value": "red"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "har_entries"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "dnsEndTime"
          },
          "x2": {
            "scale": "time",
            "field": "connectEndTime"
          },
          "height": {
            "value": 3
          },
          "yc": {
            "scale": "url",
            "field": "request.url",
            "band": 0.5
          },
          "fill": {
            "value": "orange"
          }
        },
        "update": {
          "fill": {
            "value": "orange"
          }
        },
        "hover": {
          "fill": {
            "value": "red"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "har_entries"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "sslStartTime"
          },
          "x2": {
            "scale": "time",
            "field": "sslEndTime"
          },
          "height": {
            "value": 3
          },
          "yc": {
            "scale": "url",
            "field": "request.url",
            "band": 0.5
          },
          "fill": {
            "value": "darkorange"
          }
        },
        "update": {
          "fill": {
            "value": "darkorange"
          }
        },
        "hover": {
          "fill": {
            "value": "red"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "har_entries"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "connectEndTime"
          },
          "x2": {
            "scale": "time",
            "field": "sendEndTime"
          },
          "height": {
            "value": 5
          },
          "yc": {
            "scale": "url",
            "field": "request.url",
            "band": 0.5
          },
          "fill": {
            "value": "lightblue"
          }
        },
        "update": {
          "fill": {
            "value": "lightblue"
          }
        },
        "hover": {
          "fill": {
            "value": "red"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "har_entries"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "sendEndTime"
          },
          "x2": {
            "scale": "time",
            "field": "receiveEndTime"
          },
          "height": {
            "value": 5
          },
          "yc": {
            "scale": "url",
            "field": "request.url",
            "band": 0.5
          },
          "fill": {
            "value": "steelblue"
          }
        },
        "update": {
          "fill": {
            "value": "steelblue"
          }
        },
        "hover": {
          "fill": {
            "value": "red"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "har_pages"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "dclTime"
          },
          "height": {"field": {"group": "height"}, "offset": 8},
          "strokeWidth": {
            "value": 1
          },
          "stroke": {
            "value": "steelblue"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "har_pages"
      },
      "encode": {
        "enter": {
          "text": {"value": "DCL"},
          "angle": {"value": -90},
          "x": {
            "scale": "time",
            "field": "dclTime",
            "offset": 10
          },
          "y": {
            "value": 20
          },
          "fill": {
            "value": "steelblue"
          }
        }
      }
    },
    {
      "type": "rect",
      "from": {
        "data": "har_pages"
      },
      "encode": {
        "enter": {
          "x": {
            "scale": "time",
            "field": "pageLoadTime"
          },
          "height": {"field": {"group": "height"}, "offset": 8},
          "strokeWidth": {
            "value": 1
          },
          "stroke": {
            "value": "red"
          }
        }
      }
    },
    {
      "type": "text",
      "from": {
        "data": "har_pages"
      },
      "encode": {
        "enter": {
          "text": {"value": "PLT"},
          "angle": {"value": -90},
          "x": {
            "scale": "time",
            "field": "pageLoadTime",
            "offset": 10
          },
          "y": {
            "value": 20
          },
          "fill": {
            "value": "red"
          }
        }
      }
    }
  ]
}
@endvega
