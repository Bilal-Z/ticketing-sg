import {
	Listener,
	OrderCancelledEvent,
	Subjects,
} from '@bz-ticketing-ms-sg/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		// find the ticket that order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		// if no ticket throw error
		if (!ticket) {
			throw new Error('Ticket not found');
		}

		// unset ticket order id
		ticket.set({ orderId: undefined });

		// save ticket
		await ticket.save();

		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			orderId: ticket.orderId,
			version: ticket.version,
		});

		// ack the message
		msg.ack();
	}
}
