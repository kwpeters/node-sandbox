///<reference path="../typings/index.d.ts"/>

import * as Promise from "bluebird";
import * as _ from "lodash";


/**
 * The value that will be multiplied by successively higher powers of 2 when
 * calculating delay time during exponential backoff.
 * @type {number}
 */
const BACKOFF_MULTIPLIER: number = 20;


/**
 * Gets a Promise that will resolve with resolveValue after the specified number
 * of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to dealy before the Promise
 * will be resolved.
 *
 * @param {any} resolveValue - The value the Promise will be resolved with.
 *
 * @returns {Promise} A Promise that will be resolved with the specified value
 * after the specified delay
 */
export function getTimerPromise<ResolveType>(
    ms:             number,
    resolveValue:  ResolveType
): Promise<ResolveType> {
    "use strict";

    return new Promise(
        (resolve: (resolveValue: ResolveType) => void, reject: (err: any) => void) => {
            setTimeout(() => {
                resolve(resolveValue);
            }, ms);
        }
    );

}


/**
 * Adapts a promise-returning function into a promise-returning function that
 * will retry the operation up to maxNumAttempts times before rejecting.
 * Retries are performed using exponential backoff.
 *
 * @param theFunc - The promise-returning function that will be retried multiple
 * times
 *
 * @param maxNumAttempts - The maximum number of times to invoke theFunc before
 * rejecting the returned Promise.  This argument should always be greater than
 * or equal to 1.  If it is not, theFunc will be tried only once.
 *
 * @returns {Promise} A Promise that will be resolved immediately (with the same
 * value) when the promise returned by the Func resolves.  If the Promise
 * returned by theFunc rejects, it will be retried up to maxNumAttempts
 * invocations.  If the Promise returned by the last invocation of theFunc
 * rejects, the returned Promise will be rejected with the same value.
 */
export function retry<ResolveType>(
    theFunc:         () => Promise<ResolveType>,
    maxNumAttempts:  number
):Promise<ResolveType> {
    "use strict";
    return retryWhileImpl(theFunc, () => true, maxNumAttempts, 0);
}


/**
 * Adapts a promise-returning function into a promise-returning function that
 * will continue to retry the operation as long as whilePredicate returns true
 * up to maxNumAttempts attempts before rejecting.  Retries are performed using
 * exponential backoff.
 *
 * @param theFunc - The promise-returning function that will be retried multiple
 * times
 *
 * @param whilePredicate - A function that determines whether the operation
 * should continue being retried.  This function takes the value returned by the
 * last rejection and returns true if retrying should continue or false otherwise.
 *
 * @param maxNumAttempts - The maximum number of times to invoke theFunc before
 * rejecting the returned Promise.  This argument should always be greater than
 * or equal to 1.  If it is not, theFunc will be tried only once.
 *
 * @returns {Promise} A Promise that will be resolved immediately (with the same
 * value) when the promise returned by the Func resolves.  If the Promise
 * returned by theFunc rejects, it will be retried up to maxNumAttempts
 * invocations.  If the Promise returned by the last invocation of theFunc
 * rejects, the returned Promise will be rejected with the same value.
 */
export function retryWhile<ResolveType>(
    theFunc:() => Promise<ResolveType>,
    whilePredicate: (err: any) => boolean,
    maxNumAttempts:number)
:Promise<ResolveType> {
    "use strict";
    return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, 0);
}


/**
 * Recursive implementation of retryWhile(), allowing for additional
 * implementation specific arguments.
 * @param theFunc - The operation to perform
 * @param whilePredicate - Predicate that determines whether to retry
 * @param maxNumAttempts - Maximum number of invocations of theFunc
 * @param attemptsSoFar - Number of theFunc invocations so far
 * @returns {Promise} The Promise returned to the client
 */
function retryWhileImpl<ResolveType>(
    theFunc:         () => Promise<ResolveType>,
    whilePredicate:  (err: any) => boolean,
    maxNumAttempts:  number,
    attemptsSoFar:   number
): Promise<ResolveType> {
    "use strict";
    return new Promise(
        (resolve: (value: ResolveType|Promise<ResolveType>) => void, reject: (err: any) => void) => {

            ++attemptsSoFar;
            theFunc()
                .then(
                    (value: ResolveType) => {
                        // The current iteration resolved.  Return the value to the client immediately.
                        resolve(value);
                    },
                    (err: any): void => {
                        // The promise was rejected.
                        if ((attemptsSoFar >= maxNumAttempts) || !whilePredicate(err)) {
                            reject(err);
                        } else {
                            const backoffBaseMs: number = Math.pow(2, attemptsSoFar - 1) * BACKOFF_MULTIPLIER;

                            // A random amount of time should be added to or
                            // subtracted from the base so that multiple retries
                            // don't get stacked on top of each other, making
                            // the congestion even worse.  This random range
                            // should be either the multiplier or 25% of the
                            // calculated base, whichever is larger.

                            const randomHalfRange: number = Math.max(BACKOFF_MULTIPLIER, 0.25 * backoffBaseMs);
                            const randomMs: number = _.random(-1 * randomHalfRange, randomHalfRange);
                            const delayMs: number = backoffBaseMs + randomMs;

                            //console.log("Failed. Queuing next attempt in " + backoffBaseMs + " + " + randomMs + " (" + delayMs + ") ms");
                            const timerPromise: Promise<void> = getTimerPromise(delayMs, undefined);
                            resolve(
                                timerPromise
                                    .then(() => {
                                        return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, attemptsSoFar);
                                    })
                            );
                        }
                    }
            );
        }
    );
}
