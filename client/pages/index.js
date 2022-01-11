import Link from 'next/link';

const Landing = ({ currentUser, tickets }) => {
	const ticketList = tickets.map((ticket) => {
		return (
			<tr key={ticket.id}>
				<td>{ticket.title}</td>
				<td>{ticket.price}</td>
				<td>
					<Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
						<a>View</a>
					</Link>
				</td>
			</tr>
		);
	});

	return (
		<div>
			<div className="d-flex justify-content-between">
				<h1>Tickets</h1>
				<div className="d-flex align-items-center">
					<Link href="/tickets/new">
						<a className="btn btn-primary" role="button">
							<span className="font-weight-bold h4">+</span> New
						</a>
					</Link>
				</div>
			</div>
			<table className="table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Price</th>
						<th>Link</th>
					</tr>
				</thead>
				<tbody>{ticketList}</tbody>
			</table>
		</div>
	);
};

Landing.getInitialProps = async (context, client, currentUser) => {
	const { data } = await client.get('/api/tickets');

	return { tickets: data };
};

export default Landing;

// http://ingress-nginx-controller.ingress-nginx.svc.cluster.local
