import {
	Publisher,
	Subjects,
	TicketCreatedEvent,
} from '@bz-ticketing-ms-sg/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
