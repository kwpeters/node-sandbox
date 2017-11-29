


export class Person {

    private _firstName: string;
    private _lastName: string;

    constructor(firstName: string, lastName: string) {
        this._firstName = firstName;
        this._lastName = lastName;
        Object.seal(this);
    }


    public rename(firstName: string, lastName: string): void {
        this._firstName = firstName;
        this._lastName = lastName;
    }


    public greet(): void {
        console.log(`Hello ${this._firstName} ${this._lastName}`);
    }


}

Object.freeze(Person.prototype);
Object.freeze(exports);
