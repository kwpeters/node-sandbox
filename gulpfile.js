var gulp    = require("gulp"),
    path    = require("path"),
    del     = require("del"),
    gh      = require("gulp-helpers");


////////////////////////////////////////////////////////////////////////////////
// default
////////////////////////////////////////////////////////////////////////////////
gulp.task("default", function () {
});


////////////////////////////////////////////////////////////////////////////////
// clean
////////////////////////////////////////////////////////////////////////////////
gulp.task("clean", function () {
    "use strict";

    del.sync(["dist", "tmp", "typings"]);
});


////////////////////////////////////////////////////////////////////////////////
// build
////////////////////////////////////////////////////////////////////////////////

gulp.task("build", ["clean"], function () {
    "use strict";
    return buildJs();
});


function getSrcGlobs(includeUnitTestFiles) {
    "use strict";

    var srcGlobs = ["src/**/*.ts",
                    "!src/browser/**/*.ts"];

    if (!includeUnitTestFiles) {
        srcGlobs.push("!src/**/*.spec.ts");
        srcGlobs.push("!src/test/**/*");
    }

    return srcGlobs;
}

function getTsConfig(emitDeclarationFiles) {
    "use strict";

    const compilerOptions = require("./tsconfig.json").compilerOptions;
    compilerOptions.declaration = !!emitDeclarationFiles;
    return compilerOptions;
}

function buildJs() {
    "use strict";

    var ts         = require("gulp-typescript"),
        sourcemaps = require("gulp-sourcemaps"),
        outDir     = path.join(__dirname, "dist", "node"),
        tsResults;

    tsResults = gulp.src(getSrcGlobs(false))
        .pipe(sourcemaps.init())
        .pipe(ts(getTsConfig(true), ts.reporter.longReporter()));

    var jsStream = tsResults.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outDir));

    var defsStream = tsResults.dts
        .pipe(gulp.dest(outDir));

    return gh.streamsToPromise(jsStream, defsStream);
}


////////////////////////////////////////////////////////////////////////////////
// ut
////////////////////////////////////////////////////////////////////////////////
gulp.task(
    "ut",
    function () {
        "use strict";

        var outDir = path.join(__dirname, "tmp", "ut");

        return gh.buildTypeScript(getSrcGlobs(true), outDir, outDir)
            .then(function () {
                var tape   = require("gulp-tape"),
                    faucet = require("faucet"),
                    stream;

                stream = gulp.src(outDir + "/**/*.spec.js")
                    .pipe(tape({reporter: faucet()}));

                return gh.streamsToPromise(stream);
            });
    }
);



