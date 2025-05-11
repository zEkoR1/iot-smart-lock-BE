
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const morgan = require("morgan");
const authRoutes = require('./routes/auth.routes')
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

app.post('/data', async (req, res) => {
    const { deviceId, payload } = req.body;
    await prisma.deviceData.create({ data: { deviceId, payload } });
    res.sendStatus(200);
});
app.use('/api', authRoutes)

app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
