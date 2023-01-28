import express from 'express'
import cookieparser from 'cookie-parser'
import { config } from "dotenv";
import courseRouter from './routes/CourseRoutes.js';
import userRouter from './routes/userRoutes.js';
import ErrorMiddleware from './middlewares/Error.js';

config({
    path:"./config/config.env"
});
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieparser())

app.use('/api/v1',courseRouter)
app.use('/api/v1',userRouter)

app.use(ErrorMiddleware)
export default app