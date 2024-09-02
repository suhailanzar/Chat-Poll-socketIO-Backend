import express from 'express'
const app = express()
import dotenv from 'dotenv';
import cors from 'cors'
import connectDatabase from './dataBase';
import userRouter from './routers/userRoutes';
import { configureSocket } from './services/chatServices';

dotenv.config();
const PORT = process.env.PORT || 3000;


(async () => {
  try {
    const db = await connectDatabase();
      console.log('Database connection successful');
    
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
})();

const corsOptions = {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cors(corsOptions))
app.use('/',userRouter)




const server = app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
});

configureSocket(server)

