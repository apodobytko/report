function ganntChart() {

    const data = JSON.parse($('.gannt').text());
    const tests = data.tests;
    const testStatus = {
        "passed": "bar",
        "failed": "bar-failed",
        "skipped": "bar-skipped",
        "passed_slow": "bar-passed_slow",
    };

    tests.forEach(test => {
        test.startDate = new Date(test.started);
        test.endDate = new Date(test.ended);
        test.name = test.name.replace("TestCase", "");
        test.status = test.state;
        test.taskName = test.process;

        if (test.time > 60 && test.status == "passed") {
            test.status = "passed_slow";
        }
    });

    tests.sort((a, b) => a.endDate - b.endDate);
    const maxDate = tests[tests.length - 1].endDate;
    tests.sort((a, b) => a.startDate - b.startDate);
    const minDate = tests[0].startDate;

    const format = "%H:%M:%S";

    const processes = new Array();
    tests.forEach(test => {
        processes.push(test.process);
    });


    const Gantt = d3.gantt().taskTypes(processes).taskStatus(testStatus).tickFormat(format);
    new Gantt(tests);
};