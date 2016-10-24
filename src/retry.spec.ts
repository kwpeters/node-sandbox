import * as test from "tape";
import {retry, getTimerPromise, retryWhile} from "./retry";
import * as Promise from "bluebird";

test("getTimePromise()",
    function (t: test.Test): void {

        t.test("should resolve after the specified amount of time",
            function (t: test.Test): void {
                
                const start: number = Date.now();
                const delayMs: number = 200;
                
                getTimerPromise(delayMs, "foo").then(
                    (val) => {
                        t.equal(val, "foo");
                        t.assert(Date.now() >= start + delayMs);
                        t.end();
                    }
                );
            }
        );
    }
);



test("retry()",
    function (t: test.Test): void {

        
        t.test("should resolve if the given function eventually succeeds",
            function (t: test.Test): void {

                const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(2, "foo", "rejected");

                retry(theFunc, 3)
                    .then(
                        (val) => {
                            t.equal(val, "foo");
                            t.end();
                        },
                        () => {
                            t.fail("The promise should not have rejected.");
                        }
                    );
            }
        );


        t.test("should reject if the given function never succeeds",
            function (t: test.Test): void {

                const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(5, "bar", "rejected");

                retry(theFunc, 3)
                    .then(
                        () => {
                            t.fail("The promise should not have resolved.");
                        },
                        (err: any) => {
                            t.equal(err, "rejected");
                            t.end();
                        }
                    );
            }
        );


    }
);


/**
 * A factory that returns a function that returns a promise. The first n times
 * the function is called, it will return a rejected promise.  After that, it
 * will return resolved promises.
 *
 * @param {number} numFailures - The number of times the returned function
 * should return a rejected promise.
 *
 * @param {T} resolveValue - The value that the returned promise will be
 * resolved with
 *
 * @param {U} rejectValue - The value that the returned promise will reject with
 *
 * @returns A function that will return a rejected promise the first n times it
 * is called.
 */
function getFuncThatWillRejectNTimes<T, U>(numFailures: number, resolveValue: T, rejectValue: U): () => Promise<T> {
    "use strict";

    let numFailuresRemaining: number = numFailures;

    return () => {
        if (numFailuresRemaining > 0) {
            --numFailuresRemaining;
            return Promise.reject(rejectValue);
        }
        return Promise.resolve(resolveValue);
    };
}


test("retryWhile()",
    function (t: test.Test): void {
        
        t.test("will reject immediately if the while predicate says to stop trying",
            function (t: test.Test): void {

                const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(5, "bar", "rejected");

                retryWhile(theFunc, () => false, 1000)
                    .then(
                        () => {
                            t.fail("The promise should not have resolved.");
                        },
                        (err: any) => {
                            t.equal(err, "rejected");
                            t.end();
                        }
                    );
            }
        );


        t.test("will eventually resolve if the while predicate always returns true",
            function (t: test.Test): void {

                const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(5, "bar", "rejected");

                retryWhile(
                    theFunc,
                    (err: string) => {
                        t.equal(err, "rejected");
                        return err === "rejected";
                    },
                    1000)
                    .then(
                        (value) => {
                            t.equal(value, "bar");
                            t.end();
                        },
                        (err: any) => {
                            t.fail("The promise should not have rejected.");
                        }
                    );
            }
        );


    }
);
