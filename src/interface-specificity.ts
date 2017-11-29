
interface IFoo {
    foo(a: {}): void;
}

interface IFooSpecific extends IFoo {
    foo(a: {bar: number}): void;
}

class Bar implements IFooSpecific {
    public foo() {
    }
}

