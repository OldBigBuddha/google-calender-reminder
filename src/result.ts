// fork form https://yatsbashy.hatenablog.com/entry/typescript-simple-result
type Result<T = unknown, E = unknown> = Success<T> | Failure<E>

class Success<T = unknown> {
    readonly isSuccess = true;
    readonly isFailure = false;
    constructor(readonly value: T) { }
}

class Failure<E = unknown> {
    readonly isSuccess = false;
    readonly isFailure = true;
    constructor(readonly value?: E) { }
}