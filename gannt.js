d3.gantt = () => {
    const FIT_TIME_DOMAIN_MODE = "fit";
    const FIXED_TIME_DOMAIN_MODE = "fixed";

    let margin = {
        top: 60,
        right: 120,
        bottom: 10,
        left: 120
    };

    let selector = '.chart';
    let timeDomainStart = d3.time.day.offset(new Date(), -3);
    let timeDomainEnd = d3.time.hour.offset(new Date(), +3);
    let timeDomainMode = FIT_TIME_DOMAIN_MODE; // fixed or fit
    let taskTypes = [];
    let taskStatus = [];
    let height = $(window).height() - margin.top - margin.bottom - 100;
    let width = $(window).width() - margin.right - margin.left - 5;

    let tickFormat = "%H:%M:%S";

    const keyFunction = d => d.startDate + d.taskName + d.endDate;

    const rectTransform = d => `translate(${x(d.startDate)},${y(d.taskName)})`;

    var x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);

    var y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], .1);

    let xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
        .tickSize(8).tickPadding(8);

    let yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);

    const initTimeDomain = tasks => {
        if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
            if (tasks === undefined || tasks.length < 1) {
                timeDomainStart = d3.time.day.offset(new Date(), -3);
                timeDomainEnd = d3.time.hour.offset(new Date(), +3);
                return;
            }
            tasks.sort((a, b) => a.endDate - b.endDate);
            timeDomainEnd = tasks[tasks.length - 1].endDate;
            tasks.sort((a, b) => a.startDate - b.startDate);
            timeDomainStart = tasks[0].startDate;
        }
    };

    const initAxis = () => {
        x = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
        y = d3.scale.ordinal().domain(taskTypes).rangeRoundBands([0, height - margin.top - margin.bottom], .1);
        xAxis = d3.svg.axis().scale(x).orient("bottom")
            .ticks(d3.time.minutes, 1) // size of ticks
            .tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
            .tickSize(8).tickPadding(8);

        yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
    };

    class Gantt {
        constructor(tasks) {

            initTimeDomain(tasks);
            initAxis();
            $(selector).find('svg').remove();

            const svg = d3.select(selector)
                .append("svg")
                .attr("class", "chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("class", "Gantt-chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            const tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html((d) => {
                    const green = "#37CD3C";
                    const color = (d.time > 60 ? "red" : green);
                    return `<strong>Time:</strong><span style='color:${color}'>${d.time}s</span></br>
                    <strong>Test Name:</strong> <span style='color:#B0B0B0'>${d.name}</span></br>
                    <strong>Description:</strong> <span style='color:#B0B0B0'>${d.description}</span>`;
                });

            svg.call(tip);

            svg.selectAll(".chart")
                .data(tasks, keyFunction).enter()
                .append("rect")
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("class", d => {
                    if (taskStatus[d.status] == null) {
                        return "bar";
                    }
                    return taskStatus[d.status];
                })
                .attr("y", 0)
                .attr("transform", rectTransform)
                .attr("height", d => y.rangeBand())
                .attr("width", d => x(d.endDate) - x(d.startDate))
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);


            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
                .transition()
                .call(xAxis);

            svg.append("g").attr("class", "y axis").transition().call(yAxis);


            const verticalLine = svg.append('line')
              .attr({ 'x1': 0, 'y1': 0, 'x2': 0, 'y2': height - margin.top })
              .attr("stroke", "steelblue")
              .attr('class', 'verticalLine');

            const verticalLineText = svg.append('text')
              .attr({ x: 0, y :0 })
              .attr('text-anchor', 'middle')
              .style("font-size","18px")
              .text('')
              .attr('class', 'verticalLineText');

            svg.on('mousemove', function () {
                let xPos = d3.mouse(this)[0];
                d3.select(".verticalLine").attr("transform", ()=> `translate(${xPos},0)`);
                d3.select(".verticalLineText").text(x.invert(xPos)).attr("x", xPos);
            });

            return Gantt;

        }

        static redraw(tasks) {

            initTimeDomain(tasks);
            initAxis();

            const svg = d3.select(".chart");

            const ganttChartGroup = svg.select(".Gantt-chart");
            const rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

            rect.enter()
                .insert("rect", ":first-child")
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("class", d => {
                    if (taskStatus[d.status] == null) {
                        return "bar";
                    }
                    return taskStatus[d.status];
                })
                .transition()
                .attr("y", 0)
                .attr("transform", rectTransform)
                .attr("height", d => y.rangeBand())
                .attr("width", d => x(d.endDate) - x(d.startDate));

            rect.transition()
                .attr("transform", rectTransform)
                .attr("height", d => y.rangeBand())
                .attr("width", d => x(d.endDate) - x(d.startDate));

            rect.exit().remove();

            svg.select(".x").transition().call(xAxis);
            svg.select(".y").transition().call(yAxis);

            return Gantt;
        }

        static margin(value) {
            if (!arguments.length)
                return margin;
            margin = value;
            return Gantt;
        }

        static timeDomain(value) {
            if (!arguments.length)
                return [timeDomainStart, timeDomainEnd];
            timeDomainStart = +value[0], timeDomainEnd = +value[1];
            return Gantt;
        }

        /**
         * @param {string}
         *                vale The value can be "fit" - the domain fits the data or
         *                "fixed" - fixed domain.
         */
        static timeDomainMode(value) {
            if (!arguments.length)
                return timeDomainMode;
            timeDomainMode = value;
            return Gantt;

        }

        static taskTypes(value) {
            if (!arguments.length)
                return taskTypes;
            taskTypes = value;
            return Gantt;
        }

        static taskStatus(value) {
            if (!arguments.length)
                return taskStatus;
            taskStatus = value;
            return Gantt;
        }

        static width(value) {
            if (!arguments.length)
                return width;
            width = +value;
            return Gantt;
        }

        static height(value) {
            if (!arguments.length)
                return height;
            height = +value;
            return Gantt;
        }

        static tickFormat(value) {
            if (!arguments.length)
                return tickFormat;
            tickFormat = value;
            return Gantt;
        }

        static selector(value) {
            if (!arguments.length)
                return selector;
            selector = value;
            return Gantt;
        }
    }

    return Gantt;
};
