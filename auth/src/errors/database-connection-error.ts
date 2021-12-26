import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
	statusCode = 500;
	reason = 'Error connectiong to database';
	constructor() {
		super('error connecting to DB');

		// only because extending built in class
		Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
	}

	serializeErrors() {
		return [{ message: this.reason }];
	}
}
