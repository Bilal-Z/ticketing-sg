import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedEvent } from '@bz-ticketing-ms-sg/common';

const setup = async () => {
	// create instance of listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	// create and save ticket
	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'aaloo',
		price: 20,
	});

	await ticket.save();

	// create a fake data event
	const data: TicketUpdatedEvent['data'] = {
		version: ticket.version + 1,
		id: ticket.id,
		title: 'new aaloo',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, ticket };
};

it('finds updates and save a ticket', async () => {
	const { listener, data, msg, ticket } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.title).toEqual(data.title);
	expect(updatedTicket!.price).toEqual(data.price);
	expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('doesnt ack if event has skipped version number', async () => {
	const { listener, data, msg, ticket } = await setup();

	data.version = 10;

	await expect(listener.onMessage(data, msg)).rejects.toThrow();

	expect(msg.ack).not.toHaveBeenCalled();
});
