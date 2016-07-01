
function ganntChart() {
    const TIME_OFFSET = 180; // 180 minutes = 3 hours

    const data = JSON.parse($('.gannt').text());
    const tests = data.tests;
    const testStatus = {
        "passed": "bar",
        "failed": "bar-failed",
        "skipped": "bar-skipped",
        "passed_slow": "bar-passed_slow",
    };

    tests.forEach(test => {
        // add timeoffset
        test.startDate = new Date(+new Date(test.started) + TIME_OFFSET * 60 * 1000);
        test.endDate = new Date(+new Date(test.ended) + TIME_OFFSET * 60 * 1000);
        test.name = test.name.replace("TestCase", "");
        test.status = test.state;
        test.taskName = test.process;

        if (test.time > 60 && test.status == "passed") {
            test.status = "passed_slow";
        }
    });

    tests.sort((a, b) => a.startDate - b.startDate);
    const format = "%H:%M:%S";
    const processes = tests.map(test => test.process);


    const Gantt = d3.gantt().taskTypes(processes).taskStatus(testStatus).tickFormat(format);
    new Gantt(tests);
};
