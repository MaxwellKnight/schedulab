import cors from 'cors';
import express from "express";
import session from 'express-session';
import ip from './helpers/ip';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { UserRouter, PreferenceRouter, ShiftRouter, VacationRouter, ScheduleRouter, AuthRouter, TemplateRouter } from "./routes";
import { configurePassport } from './configs/passport.config';

dotenv.config();

const app = express();
const PORT = process.env.NODE_LOCAL_PORT || 5713;

// Configure session first
app.use(session({
	secret: process.env.SESSION_SECRET || 'secret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}));

// Basic middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize and configure passport
const passport = configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
	exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'],
	preflightContinue: false,
	optionsSuccessStatus: 204
}));

// Routes
app.use('/auth', AuthRouter);
app.use('/users', UserRouter);
app.use('/preferences', PreferenceRouter);
app.use('/shifts', ShiftRouter);
app.use('/vacations', VacationRouter);
app.use('/schedules', ScheduleRouter);
app.use('/templates', TemplateRouter);

app.listen(PORT, () => console.log(`server running on ${ip() || '127.0.0.1'}:${PORT}`));
