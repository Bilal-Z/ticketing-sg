import React, { useEffect, useState } from 'react';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';
import StripeCheckout from 'react-stripe-checkout';

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};
		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);
		return () => {
			clearInterval(timerId);
		};
	}, [order]);

	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
		},
		onSuccess: () => Router.push('/orders'),
	});

	if (timeLeft < 0) {
		return (
			<div className="pt-2">
				<h1>Order Expired</h1>
			</div>
		);
	}

	return (
		<div className="pt-2">
			<h1>
				Purchasing {order.ticket.title} for $ {order.ticket.price}
			</h1>
			<p>
				<span className="font-weight-bold"> time left to pay:</span>{' '}
				{timeLeft / 60 >= 1 && `${Math.floor(timeLeft / 60)} minutes`}{' '}
				{timeLeft % 60} seconds
			</p>
			{errors}
			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				stripeKey="pk_test_51KGLuHFKvEiOkfuWOWsUflOzqQIgFw7nL81LVQk1HHgRPlIiOcjXrrBMtNVGXsT71EMKQCJdfQO9TACzuiQFx1Zj00KczIS9Xx"
				amount={order.ticket.price * 100}
				email={currentUser.email}
			/>
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);

	return { order: data };
};

export default OrderShow;
