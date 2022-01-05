import {
	Publisher,
	OrderCancelledEvent,
	Subjects,
} from '@bz-ticketing-ms-sg/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
