import cors from 'cors';
import express from "express";
import ip from './helpers/ip';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {
	UserRouter,
	PreferenceRouter,
	ShiftRouter,
	VacationRouter,
	ScheduleRouter,
	AuthRouter,
	TemplateRouter,
	TeamRouter
} from "./routes";

import { configurePassport } from './configs/passport.config';

dotenv.config();

const app = express();
const PORT = process.env.NODE_LOCAL_PORT || 5713;

app.use(cors({
	origin: process.env.FRONTEND_URL,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
	exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
	preflightContinue: true,
	optionsSuccessStatus: 204
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const passport = configurePassport();
app.use(passport.initialize());

app.use('/auth', AuthRouter);
app.use('/users', UserRouter);
app.use('/preferences', PreferenceRouter);
app.use('/shifts', ShiftRouter);
app.use('/vacations', VacationRouter);
app.use('/schedules', ScheduleRouter);
app.use('/templates', TemplateRouter);
app.use('/teams', TeamRouter);

app.listen(PORT, () => console.log(`server running on ${ip() || 'localhost'}:${PORT}`));
