///<reference path="../typings/index.d.ts"/>

import {trim, trimStart, trimEnd, pad, padStart, padEnd} from "lodash";

const trimStr: string = "     trim        ";
console.log("trimStart()");
console.log("*" + trimStart(trimStr) + "*");
console.log("trimEnd()");
console.log("*" + trimEnd(trimStr) + "*");
console.log("trim()");
console.log("*" + trim(trimStr) + "*");


const padStr: string = "pad";
console.log("padStart()");
console.log(padStart(padStr, 10, "_"));
console.log("padEnd()");
console.log(padEnd(padStr, 10, "_"));
console.log("pad()");
console.log(pad(padStr, 10, "_"));

