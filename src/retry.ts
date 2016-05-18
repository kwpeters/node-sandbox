///<reference path="../typings/main.d.ts"/>

import * as Promise from "bluebird";
import * as _ from "lodash";

const BACKOFF_MULTIPLIER: number = 20;

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


export function retry<ResolveType>(theFunc:() => Promise<ResolveType>, maxNumAttempts:number):Promise<ResolveType> {
    "use strict";
    return retryWhileImpl(theFunc, () => true, maxNumAttempts, 0);
}


export function retryWhile<ResolveType>(
    theFunc:() => Promise<ResolveType>,
    whilePredicate: (err: any) => boolean,
    maxNumAttempts:number)
:Promise<ResolveType> {
    "use strict";
    return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, 0);
}


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

                            console.log("Failed. Queuing next attempt in " + backoffBaseMs + " + " + randomMs + " (" + delayMs + ") ms");
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
