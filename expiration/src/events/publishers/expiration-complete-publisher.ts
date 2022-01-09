import {
	ExpirationCompleteEvent,
	Publisher,
	Subjects,
} from '@bz-ticketing-ms-sg/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
	readonly subject = Subjects.ExpirationComplete;
}
