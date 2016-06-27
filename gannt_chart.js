function ganntChart() {

    var data = JSON.parse($('.gannt').text())
    var tests = data.tests
    var testStatus = {
        "passed": "bar",
        "failed": "bar-failed",
        "skipped": "bar-skipped",
        "passed_slow": "bar-passed_slow",
    };

    tests.forEach(function(test) {
        test.startDate = new Date(test.started);
        test.endDate = new Date(test.ended);
        test.name = test.name.replace("TestCase", "");
        test.status = test.state;
        test.taskName = test.process;

        if (test.time > 60) {
            test.status = "passed_slow";
        }
    });

    tests.sort(function(a, b) {
        return a.endDate - b.endDate;
    });
    var maxDate = tests[tests.length - 1].endDate;
    tests.sort(function(a, b) {
        return a.startDate - b.startDate;
    });
    var minDate = tests[0].startDate;

    var format = "%H:%M:%S";

    var processes = new Array();
    tests.forEach(function(test) {
        processes.push(test.process);
    });


    var gantt = d3.gantt().taskTypes(processes).taskStatus(testStatus).tickFormat(format);
    gantt(tests);
};