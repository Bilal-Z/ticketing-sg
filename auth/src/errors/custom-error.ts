export abstract class CustomError extends Error {
	constructor(message: string) {
		super(message);

		// only because extending built in class
		Object.setPrototypeOf(this, CustomError.prototype);
	}

	abstract statusCode: number;

	abstract serializeErrors(): { message: string; feild?: string }[];
}
