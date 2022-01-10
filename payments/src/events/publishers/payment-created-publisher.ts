import {
	PaymentCreatedEvent,
	Publisher,
	Subjects,
} from '@bz-ticketing-ms-sg/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
