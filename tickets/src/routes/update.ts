import {
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	requireAuth,
	validateRequest,
} from '@bz-ticketing-ms-sg/common';
import { body } from 'express-validator';
import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
	'/api/tickets/:id',
	requireAuth,
	[
		body('title').not().isEmpty().withMessage('Tile is required'),
		body('price')
			.isFloat({ gt: 0 })
			.withMessage('Price must be greater that 0'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { title, price } = req.body;

		const ticket = await Ticket.findById(req.params.id);

		if (!ticket) {
			throw new NotFoundError();
		}

		if (ticket.orderId) {
			throw new BadRequestError('Ticket is reserved, can not edit');
		}

		if (ticket.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}

		ticket.set({ title, price });

		await ticket.save();

		new TicketUpdatedPublisher(natsWrapper.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
		});

		res.send(ticket);
	}
);

export { router as updateTicketRouter };
