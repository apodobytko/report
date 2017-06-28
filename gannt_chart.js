"use strict";

function ganntChart() {
    var TIME_OFFSET = 180; // 180 minutes = 3 hours

    var data = JSON.parse($('<div></div>').html($('.gannt').text()).text().replace(/\n/g, ' '));
    var tests = data.tests;
    var testStatus = {
        "passed": "bar",
        "failed": "bar-failed",
        "skipped": "bar-skipped",
        "passed_slow": "bar-passed_slow",
        "unknown": "bar-unknown"
    };

    tests.forEach(function (test) {
        // add timeoffset
        test.startDate = new Date(+new Date(test.started) + TIME_OFFSET * 60 * 1000);
        test.endDate = new Date(+new Date(test.ended) + TIME_OFFSET * 60 * 1000);
        test.name = test.name.replace("TestCase", "");
        test.status = test.state;
        test.taskName = test.process;

        if (test.time > 30 && test.status == "passed") {
            test.status = "passed_slow";
        }
    });

    tests.sort(function (a, b) {
        return a.startDate - b.startDate;
    });
    var format = "%H:%M:%S";
    var processes = tests.map(function (test) {
        return test.process;
    });

    var Gantt = d3.gantt().taskTypes(processes).taskStatus(testStatus).tickFormat(format);
    new Gantt(tests);
};