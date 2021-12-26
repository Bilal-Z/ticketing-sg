import { CustomError } from './custom-error';

export class NotFoundError extends CustomError {
	statusCode = 404;

	constructor() {
		super('Route not found');

		// only because extending built in class
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}

	serializeErrors(): { message: string; feild?: string | undefined }[] {
		return [{ message: 'Not Found' }];
	}
}
