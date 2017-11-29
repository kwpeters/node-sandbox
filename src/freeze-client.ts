
import {Person} from "./freeze-class";

const p: Person = new Person("Kevin", "Peters");
p.greet();

p.rename("fred", "flintstone");
p.greet();

