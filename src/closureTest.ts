

function doit(): void {
    "use strict";


    let funcA: () => void;
    let funcB: () => void;

    funcA = () => {
        console.log("Executing funcA().");
        console.log("funcB:" + funcB);
    };

    funcB = () => {
        console.log("Executing funcB().");
        console.log("funcA:" + funcA);
    };
    
    funcA();
}



doit();
