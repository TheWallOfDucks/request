const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const junitReporter = require('jasmine-reporters').JUnitXmlReporter;

// remove default reporter logs
jasmine.getEnv().clearReporters();

// add jasmine-spec-reporter
jasmine.getEnv().addReporter(
    new SpecReporter({
        spec: {
            displayPending: true,
            displayStacktrace: 'all',
        },
        summary: {
            displayDuration: true,
        },
    }),
);

// add junit reporter
jasmine.getEnv().addReporter(
    new junitReporter({
        savePath: 'src/tests/reports',
        consolidateAll: true,
    }),
);
