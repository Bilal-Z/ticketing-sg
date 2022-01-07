import { OrderCreatedEvent, OrderStatus } from '@bz-ticketing-ms-sg/common';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../oreder-created-listener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	// create instance of listener
	const listener = new OrderCreatedListener(natsWrapper.client);

	// create and save a Ticket
	const ticket = Ticket.build({
		title: 'xyz',
		price: 12,
		userId: 'sad',
	});

	await ticket.save();

	// create the fake data event
	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		userId: '123',
		expiresAt: '123',
		version: 0,
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	};

	// create fake message
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};

it('sets the user id of the ticket', async () => {
	const { listener, msg, data, ticket } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
	const { listener, msg, data } = await setup();

	await listener.onMessage(data, msg);

	expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
	const { listener, msg, data } = await setup();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);

	expect(data.id).toEqual(ticketUpdatedData.orderId);
});
