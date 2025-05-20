import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import morgan from 'morgan';
import 'reflect-metadata';
import { Request, Response } from 'express';
const userRoutes = require('./routes/user.routes');
const deviceRoutes = require('./routes/device.routes');
// import authRoutes from './routes/auth.routes';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors());
app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));
app.use(express.json());
app.use(morgan('dev'));

// app.use((req, res, next) => {
//     const key = req.headers['x-api-key'];
//     if (key !== process.env.DEVICE_API_KEY) console.log("FORBIDDEN ITS WORKING ");
//     next();
// });

app.post('/data', async (req: Request, res: Response) => {
    const { deviceId, payload } = req.body;
    await prisma.deviceData.create({ data: { deviceId, payload } });
    res.sendStatus(200);
});
// app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', deviceRoutes)
app.listen(parseInt(process.env.PORT || '3000', 10), '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});
