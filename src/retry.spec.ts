///<reference path="../typings/main.d.ts"/>

import * as test from "tape";
import {retry} from "./retry";
import * as Promise from "bluebird";

test("can call retry()",
    function (t: test.Test): void {
        
        const theFunc: () => Promise<void> = getFuncThatWillRejectNTimes(2);

        retry(theFunc, 3)
            .then(
                () => {
                    console.log("succeeded.");
                    console.log("");
                    t.end();
                },
                () => {
                    console.log("failed.");
                    console.log("");
                }
            );

        
        function getFuncThatWillRejectNTimes(numFailures: number): () => Promise<void> {
            let numFailuresRemaining: number = numFailures;
            
            return () => {
                if (numFailuresRemaining > 0) {
                    --numFailuresRemaining;
                    return Promise.reject(new Error("failure"));
                }
                return Promise.resolve();
            };
        }
    }
);
