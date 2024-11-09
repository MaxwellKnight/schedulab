// src/types/global.d.ts
declare global {
	type Maybe<T> = Some<T> | None;

	interface Some<T> {
		readonly _tag: 'Some';
		readonly value: T;
	}

	interface None {
		readonly _tag: 'None';
	}

	function Some<T>(value: T): Maybe<T>;
	function None<T>(): Maybe<T>;
	function isSome<T>(option: Maybe<T>): option is Some<T>;
	function isNone<T>(option: Maybe<T>): option is None;
	function map<T, U>(option: Maybe<T>, fn: (value: T) => U): Maybe<U>;
	function unwrap<T>(option: Maybe<T>): T;
	function unwrapOr<T>(option: Maybe<T>, defaultValue: T): T;
	function andThen<T, U>(option: Maybe<T>, fn: (value: T) => Maybe<U>): Maybe<U>;
	function match<T, U>(option: Maybe<T>, patterns: { Some: (value: T) => U, None: () => U }): U;
}

interface GlobalWithMaybe extends GlobalThis {
	Some: <T>(value: T) => Maybe<T>;
	None: <T>() => Maybe<T>;
	isSome: <T>(option: Maybe<T>) => option is Some<T>;
	isNone: <T>(option: Maybe<T>) => option is None;
	map: <T, U>(option: Maybe<T>, fn: (value: T) => U) => Maybe<U>;
	unwrap: <T>(option: Maybe<T>) => T;
	unwrapOr: <T>(option: Maybe<T>, defaultValue: T) => T;
	andThen: <T, U>(option: Maybe<T>, fn: (value: T) => Maybe<U>) => Maybe<U>;
	match: <T, U>(option: Maybe<T>, patterns: { Some: (value: T) => U, None: () => U }) => U;
}

const globalObj = global as GlobalWithMaybe;

globalObj.Some = <T>(value: T): Maybe<T> => ({
	_tag: 'Some',
	value
});

globalObj.None = <T>(): Maybe<T> => ({
	_tag: 'None'
});

globalObj.isSome = <T>(option: Maybe<T>): option is Some<T> =>
	option._tag === 'Some';

globalObj.isNone = <T>(option: Maybe<T>): option is None =>
	option._tag === 'None';

globalObj.map = <T, U>(option: Maybe<T>, fn: (value: T) => U): Maybe<U> =>
	globalObj.isSome(option) ? globalObj.Some(fn(option.value)) : globalObj.None();

globalObj.unwrap = <T>(option: Maybe<T>): T => {
	if (globalObj.isSome(option)) return option.value;
	throw new Error('Called unwrap on None');
};

globalObj.unwrapOr = <T>(option: Maybe<T>, defaultValue: T): T =>
	globalObj.isSome(option) ? option.value : defaultValue;

globalObj.andThen = <T, U>(option: Maybe<T>, fn: (value: T) => Maybe<U>): Maybe<U> =>
	globalObj.isSome(option) ? fn(option.value) : globalObj.None();

globalObj.match = <T, U>(option: Maybe<T>, patterns: { Some: (value: T) => U, None: () => U }): U =>
	globalObj.isSome(option) ? patterns.Some(option.value) : patterns.None();

export { };
