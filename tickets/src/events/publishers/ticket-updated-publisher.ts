import {
	Publisher,
	Subjects,
	TicketUpdatedEvent,
} from '@bz-ticketing-ms-sg/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}
