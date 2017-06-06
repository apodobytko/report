"use strict";

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

d3.gantt = function () {
  var FIT_TIME_DOMAIN_MODE = "fit";
  var FIXED_TIME_DOMAIN_MODE = "fixed";

  var _margin = {
    top: 60,
    right: 120,
    bottom: 10,
    left: 120
  };

  var _selector = '.chart';
  var timeDomainStart = d3.time.day.offset(new Date(), -3);
  var timeDomainEnd = d3.time.hour.offset(new Date(), +3);
  var _timeDomainMode = FIT_TIME_DOMAIN_MODE; // fixed or fit
  var _taskTypes = [];
  var _taskStatus = [];
  var _height = $(window).height() - _margin.top - _margin.bottom - 100;
  var _width = $(window).width() - _margin.right - _margin.left - 5;

  var _tickFormat = "%H:%M:%S";

  var keyFunction = function keyFunction(d) {
    return d.startDate + d.taskName + d.endDate;
  };

  var rectTransform = function rectTransform(d) {
    return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
  };

  var x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, _width]).clamp(true);

  var y = d3.scale.ordinal().domain(_taskTypes).rangeRoundBands([0, _height - _margin.top - _margin.bottom], .1);

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(_tickFormat)).tickSubdivide(true).tickSize(8).tickPadding(8);

  var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

  var initTimeDomain = function initTimeDomain(tasks) {
    if (_timeDomainMode === FIT_TIME_DOMAIN_MODE) {
      if (tasks === undefined || tasks.length < 1) {
        timeDomainStart = d3.time.day.offset(new Date(), -3);
        timeDomainEnd = d3.time.hour.offset(new Date(), +3);
        return;
      }
      tasks.sort(function (a, b) {
        return a.endDate - b.endDate;
      });
      timeDomainEnd = tasks[tasks.length - 1].endDate;
      tasks.sort(function (a, b) {
        return a.startDate - b.startDate;
      });
      timeDomainStart = tasks[0].startDate;
    }
  };

  var initAxis = function initAxis() {
    x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, _width]).clamp(true);
    y = d3.scale.ordinal().domain(_taskTypes).rangeRoundBands([0, _height - _margin.top - _margin.bottom], .1);
    xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(d3.time.minutes, 1) // size of ticks
      .tickFormat(d3.time.format(_tickFormat)).tickSubdivide(true).tickSize(8).tickPadding(8);

    yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
  };

  var Gantt = function () {
    function Gantt(tasks) {
      _classCallCheck(this, Gantt);

      initTimeDomain(tasks);
      initAxis();
      $(_selector).find('svg').remove();

      var svg = d3.select(_selector).append("svg").attr("class", "chart").attr("width", _width + _margin.left + _margin.right).attr("height", _height + _margin.top + _margin.bottom).append("g").attr("class", "Gantt-chart").attr("width", _width + _margin.left + _margin.right).attr("height", _height + _margin.top + _margin.bottom).attr("transform", "translate(" + _margin.left + ", " + _margin.top + ")");

      var tip = {
        hide: function hide() {
          $('.info-tooltip-wrapper').html('');
        },
        show: function show(d) {
          var green = "#37CD3C";
          var color = d.time > 60 ? "red" : green;
          var html = "<div class=\"info-tooltip\">\n            <strong>Time:</strong><span style='color:" + color + "'>" + d.time + "s</span></br>\n            <strong>Test Name:</strong> <span style='color:#B0B0B0'>" + d.name + "</span></br>\n            <strong>Description:</strong> <span style='color:#B0B0B0'>" + d.description + "</span>\n          </div>";

          if ($('.info-tooltip-wrapper').length === 0) {
            $('<div class="info-tooltip-wrapper"></div>').appendTo(document.body);
          }
          $('.info-tooltip-wrapper').html(html);
        }
      };

      svg.selectAll(".chart").data(tasks, keyFunction).enter().append("rect").attr("rx", 5).attr("ry", 5).attr("class", function (d) {
        if (_taskStatus[d.status] == null) {
          return "bar";
        }
        return _taskStatus[d.status];
      }).attr("y", 0).attr("transform", rectTransform).attr("height", function (d) {
        return y.rangeBand();
      }).attr("width", function (d) {
        return x(d.endDate) - x(d.startDate);
      }).on('mouseover', tip.show).on('mouseout', tip.hide);

      svg.append("g").attr("class", "x axis").attr("transform", "translate(0, " + (_height - _margin.top - _margin.bottom) + ")").transition().call(xAxis);

      svg.append("g").attr("class", "y axis").transition().call(yAxis);

      var verticalLine = svg.append('line').attr({
        'x1': 0,
        'y1': 0,
        'x2': 0,
        'y2': _height - _margin.top
      }).attr("stroke", "steelblue").attr('class', 'verticalLine');

      var verticalLineText = svg.append('text').attr({
        x: 0,
        y: 0
      }).attr('text-anchor', 'middle').style("font-size", "18px").text('').attr('class', 'verticalLineText');

      $('div.chart').on('mousemove', function (ev) {
        var xPos = ev.pageX - $('line[x2=0][y2=0]').position().left;
        xPos = Math.max(xPos, 0);
        d3.select(".verticalLine").attr("transform", function () {
          return "translate(" + xPos + ",0)";
        });
        d3.select(".verticalLineText").text(x.invert(xPos)).attr("x", xPos);
      });

      return Gantt;
    }

    _createClass(Gantt, null, [{
      key: "redraw",
      value: function redraw(tasks) {

        initTimeDomain(tasks);
        initAxis();

        var svg = d3.select(".chart");

        var ganttChartGroup = svg.select(".Gantt-chart");
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

        rect.enter().insert("rect", ":first-child").attr("rx", 5).attr("ry", 5).attr("class", function (d) {
          if (_taskStatus[d.status] == null) {
            return "bar";
          }
          return _taskStatus[d.status];
        }).transition().attr("y", 0).attr("transform", rectTransform).attr("height", function (d) {
          return y.rangeBand();
        }).attr("width", function (d) {
          return x(d.endDate) - x(d.startDate);
        });

        rect.transition().attr("transform", rectTransform).attr("height", function (d) {
          return y.rangeBand();
        }).attr("width", function (d) {
          return x(d.endDate) - x(d.startDate);
        });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

        return Gantt;
      }
    }, {
      key: "margin",
      value: function margin(value) {
        if (!arguments.length) return _margin;
        _margin = value;
        return Gantt;
      }
    }, {
      key: "timeDomain",
      value: function timeDomain(value) {
        if (!arguments.length) return [timeDomainStart, timeDomainEnd];
        timeDomainStart = +value[0], timeDomainEnd = +value[1];
        return Gantt;
      }

      /**
       * @param {string}
       *                vale The value can be "fit" - the domain fits the data or
       *                "fixed" - fixed domain.
       */

    }, {
      key: "timeDomainMode",
      value: function timeDomainMode(value) {
        if (!arguments.length) return _timeDomainMode;
        _timeDomainMode = value;
        return Gantt;
      }
    }, {
      key: "taskTypes",
      value: function taskTypes(value) {
        if (!arguments.length) return _taskTypes;
        _taskTypes = value;
        return Gantt;
      }
    }, {
      key: "taskStatus",
      value: function taskStatus(value) {
        if (!arguments.length) return _taskStatus;
        _taskStatus = value;
        return Gantt;
      }
    }, {
      key: "width",
      value: function width(value) {
        if (!arguments.length) return _width;
        _width = +value;
        return Gantt;
      }
    }, {
      key: "height",
      value: function height(value) {
        if (!arguments.length) return _height;
        _height = +value;
        return Gantt;
      }
    }, {
      key: "tickFormat",
      value: function tickFormat(value) {
        if (!arguments.length) return _tickFormat;
        _tickFormat = value;
        return Gantt;
      }
    }, {
      key: "selector",
      value: function selector(value) {
        if (!arguments.length) return _selector;
        _selector = value;
        return Gantt;
      }
    }]);

    return Gantt;
  }();

  return Gantt;
};