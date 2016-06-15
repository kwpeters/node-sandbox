///<reference path="../typings/index.d.ts"/>

/*
 * This script demonstrates how you can throw a function's execution into a
 * future node event loop.
 */

(function ():void {

    let counter:number = 0;
    let iterations:number = 1000;

    const worker:() => void = () => {
        console.log(++counter);

        --iterations;
        if (iterations > 0) {
            setTimeout(worker);
        }
    };

    worker();

})();


