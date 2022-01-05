import {
	Publisher,
	OrderCreatedEvent,
	Subjects,
} from '@bz-ticketing-ms-sg/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}
