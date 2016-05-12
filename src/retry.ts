///<reference path="../typings/main.d.ts"/>

import * as Promise from "bluebird";

export function retry<ResolveType>(theFunc:() => Promise<ResolveType>, numAttempts:number):Promise<ResolveType> {
    "use strict";
    return new Promise(
        (resolve: (value: ResolveType|Promise<ResolveType>) => void, reject: (err: any) => void) => {

            theFunc().then(
                (value: ResolveType) => {
                    // The current iteration resolved.  Return the value to the client immediately.
                    console.log("resolved.");
                    resolve(value);
                },
                (err: any): void => {
                    // The promise was rejected.
                    console.log("rejected.");
                    if (numAttempts - 1 === 0) {
                        reject(err);
                    } else {
                        resolve(retry(theFunc, numAttempts - 1));
                    }
                }
            );
        }
    );
}
