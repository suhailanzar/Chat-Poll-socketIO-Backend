import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGOCONNECTION;
const dbName = "chatPolling";


    export async function connectDatabase() {
        try {
          if(uri){
            
              await mongoose.connect(uri, {
                dbName, 
              });
              console.log(`Connected to MongoDB database: ${dbName}`);
          }else{
            console.error('No MongoDB connection URI provided.');
            process.exit(1);
          }
        } catch (error) {
          console.error('Error connecting to MongoDB:', error);
          process.exit(1); 
        }
      }

export default connectDatabase;     