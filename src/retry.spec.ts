///<reference path="../typings/main.d.ts"/>


import * as test from "tape";
import {retry} from "./retry";

test("can call retry()",
    function (t: test.Test): void {
        t.ok(retry());
        t.end();
    }
);
