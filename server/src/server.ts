import cors from 'cors';
import express from "express";
import ip from './helpers/ip';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { UserRouter, PreferenceRouter, ShiftRouter, VacationRouter, ScheduleRouter, AuthRouter, TemplateRouter } from "./routes";
dotenv.config();

const app = express();

const PORT = process.env.NODE_LOCAL_PORT || 8080;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization']
}));

//routes
app.use('/auth', AuthRouter);
app.use('/users', UserRouter);
app.use('/preferences', PreferenceRouter);
app.use('/shifts', ShiftRouter);
app.use('/vacations', VacationRouter);
app.use('/schedules', ScheduleRouter);
app.use('/templates', TemplateRouter);

app.listen(PORT, () => console.log(`server running on ${ip() || '127.0.0.1'}:${PORT}`))
