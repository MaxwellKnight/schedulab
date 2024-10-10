import cors from 'cors';
import express from "express";
import ip from './helpers/ip';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { UserRouter, PreferenceRouter, ShiftRouter, VacationRouter, ScheduleRouter, AuthRouter } from "./routes";
dotenv.config();

const app = express();

const PORT 			= process.env.NODE_LOCAL_PORT 	 || 8080;
const ORIGIN_HOST = process.env.EXPRESS_ORIGIN_HOST || 'http://localhost';
const ORIGIN_PORT = process.env.EXPRESS_ORIGIN_PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ 
	credentials: true,  
	origin: `${ORIGIN_HOST}:${ORIGIN_PORT}` 
}));

//routes
app.use('/auth', 			AuthRouter);
app.use('/users', 		UserRouter);
app.use('/preferences', PreferenceRouter);
app.use('/shifts', 		ShiftRouter);
app.use('/vacations', 	VacationRouter);
app.use('/schedules', 	ScheduleRouter);

app.listen(PORT, () => console.log(`server running on ${ip()}:${PORT}`))