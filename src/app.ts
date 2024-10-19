import express, { Request, Response } from 'express';
import scheduledPaymentJob from './jobs/cronJobs';
import dotenv from 'dotenv';
import cors from 'cors';
import { router } from './routes';
import { checkConnection } from './config/database'; //Conexion con ORM sequelize
const app = express();
app.use(cors());
app.use(express.json());
app.use(router);
dotenv.config();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

scheduledPaymentJob.start();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    checkConnection;
})