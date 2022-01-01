import buildClient from '../api/build-client';

const Landing = ({ currentUser }) => {
	console.log(currentUser);
	return (
		<h1> {currentUser ? 'You are signed in' : 'You are not signed in'}</h1>
	);
};

Landing.getInitialProps = async (context) => {
	const client = buildClient(context);
	const { data } = await client
		.get('/api/users/currentuser')
		.catch((err) => console.log(err));

	return data;
};

export default Landing;

// http://ingress-nginx-controller.ingress-nginx.svc.cluster.local
