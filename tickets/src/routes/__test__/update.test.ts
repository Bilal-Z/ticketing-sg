import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('return 404 if provided id does not exist', async () => {
	const title = 'valid title';
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({ title, price: 10 })
		.expect(404);
});

it('return 401 if user not authenticated', async () => {
	const title = 'valid title';
	const id = new mongoose.Types.ObjectId().toHexString();
	await request(app)
		.put(`/api/tickets/${id}`)
		.send({ title, price: 10 })
		.expect(401);
});

it('return 401 if user does not own ticket', async () => {
	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({
			title: 'valid title',
			price: 10,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', global.signin())
		.send({ title: 'valid title 2', price: 20 })
		.expect(401);
});

it('return 400 if user provides an invalid title or price', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'valid title',
			price: 10,
		})
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: '', price: 20 })
		.expect(400);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'valid title', price: -20 })
		.expect(400);
});

it('updates the ticket provided valid inputs', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'valid title',
			price: 10,
		})
		.expect(201);

	const updatedTitle = 'valid title 2';
	const updatedPrice = 20;
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: updatedTitle, price: updatedPrice })
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.price).toEqual(updatedPrice);
	expect(ticketResponse.body.title).toEqual(updatedTitle);
});

it('publishes an event', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({
			title: 'valid title',
			price: 10,
		})
		.expect(201);

	const updatedTitle = 'valid title 2';
	const updatedPrice = 20;
	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: updatedTitle, price: updatedPrice })
		.expect(200);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});
