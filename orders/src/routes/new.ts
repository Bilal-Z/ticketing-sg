import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import {
	BadRequestError,
	NotFoundError,
	requireAuth,
	validateRequest,
} from '@bz-ticketing-ms-sg/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
	'/api/orders',
	requireAuth,
	[
		body('ticketId')
			.not()
			.isEmpty()
			.custom((input: string) => mongoose.Types.ObjectId.isValid(input))
			.withMessage('TicketId must be provided'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;

		// find the ticket that user is trying to buy in DB
		const ticket = await Ticket.findById(ticketId);

		if (!ticket) {
			throw new NotFoundError();
		}

		// make sure ticket is not already reserved
		// ---
		// run query to look at all orders
		// find order where the ticket is the ticket we just found and
		// the order status is not cancelled
		// if we find an order from that means the ticket is reserved
		const isReserved = await ticket.isReserved();

		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		// calculate exoiration datetime for order
		const expiration = new Date();
		expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

		// build the order and save it to DB
		const order = Order.build({
			userId: req.currentUser!.id,
			status: OrderStatus.Created,
			expiresAt: expiration,
			ticket: ticket,
		});

		await order.save();

		// publish an event saying order was created
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: order.status,
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			version: order.version,
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
		});
		res.status(201).send(order);
	}
);

export { router as newOrderRouter };
