import React from 'react';

const OrderIndex = ({ orders }) => {
	return (
		<div className=" container-sm">
			<ul>
				{orders.map((order) => {
					return (
						<li key={order.id}>
							<div className="d-flex justify-content-between">
								<h4>{order.ticket.title}</h4>
								<h4>{order.status}</h4>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

OrderIndex.getInitialProps = async (context, client) => {
	const { data } = await client.get('/api/orders');

	return { orders: data };
};

export default OrderIndex;
