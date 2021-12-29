import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { BadRequestError } from '../errors/bad-request-error';
import { validateRequest } from '../middlewares/validate-request';
import { Password } from '../services/password';

const router = express.Router();

router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Invalid Email'),
		body('password').trim().notEmpty().withMessage('must supply password'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const { email, password } = req.body;

		const user = await User.findOne({ email });

		if (!user) {
			throw new BadRequestError('invalid credentials');
		}

		const passwordMatch = await Password.compare(user.password, password);

		if (!passwordMatch) {
			throw new BadRequestError('invalid credentials');
		}

		const userJwt = jwt.sign(
			{ id: user.id, email: user.email },
			process.env.JWT_KEY!
		);
		req.session = {
			jwt: userJwt,
		};

		res.status(200).send(user);
	}
);

export { router as signinRouter };
