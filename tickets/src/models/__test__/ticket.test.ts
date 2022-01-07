import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
	// create an instance of ticket
	const ticket = Ticket.build({
		title: 'aaloo show',
		price: 5,
		userId: '123',
	});

	// save to db
	await ticket.save();

	// fetch ticket twice
	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	// make two seperate changes to both instances
	firstInstance!.set({ price: 10 });

	// save the first fetched ticket
	await firstInstance!.save();

	// save the second fetched ticket and expect an error

	await expect(secondInstance!.save()).rejects.toThrow();
});

it('increments the version number on multiple save', async () => {
	const ticket = Ticket.build({
		title: 'aaloo show',
		price: 5,
		userId: '123',
	});

	await ticket.save();
	expect(ticket.version).toEqual(0);

	await ticket.save();
	expect(ticket.version).toEqual(1);

	await ticket.save();
	expect(ticket.version).toEqual(2);
});
