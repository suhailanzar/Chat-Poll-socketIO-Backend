import { NextFunction, Request,Response } from "express";
import { UserModel } from "../models/userModel";
import bcrypt from 'bcryptjs';
import { generateToken } from "../services/jwtService";
import { Message } from "../models/Message";
import { GroupMessage } from "../models/groupchat";
import Poll from "../models/groupPolls";

const SALT_ROUNDS = 10; // Number of salt rounds for hashing

// Function to hash a password
async function hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    return hashedPassword;
}


export const userLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.body) {
            res.status(400).json({ message: "No data were provided" });
            return; // Ensure no further code is executed
        }

        const email = req.body.email ? req.body.email.trim() : null;
        const password = req.body.password ? req.body.password.trim() : null;

        if (!email || !password) {
            res.status(400).json({ message: "Email and password are required" });
            return; // Ensure no further code is executed
        }

        const foundUser = await UserModel.findOne({ email });

        if (!foundUser) {
            res.status(401).json({ message: "User not found" });
            return; // Ensure no further code is executed
        }

        const isMatch = await bcrypt.compare(password, foundUser.password);

        if (!isMatch) {
            res.status(401).json({ message: "Invalid password" });
            return; // Ensure no further code is executed
        }

        const token = generateToken( foundUser._id as string,process.env.JWT_SECRET as string);
        res.status(200).json({ message: "Login successful" , Token:token, userdata:foundUser });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: "Login failed" });
    }
};


export const userSignup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email,password } = req.body; 
        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            res.status(409).json({ message: "User already exists" }); 
            return; 
        }
        const hashedPassword = await hashPassword(password);


        const newUser = new UserModel({ ...req.body, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "User signup successful" });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: "Signup failed" });
    }
};

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {   
        const users = await UserModel.find();
        res.status(200).json({users});

    } catch (error) {
        console.error('Error during fetching users:', error);
        res.status(500).json({ message: "Failed to retrieve users" });
    }
};

export const getMessagesUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        return res
          .status(500)
          .json({ message: 'Request body is missing' });
      }

      const data = req.body;

      const messages = await Message.find({
        $or: [
          { senderId: data.userid, receiverId: data.trainerid },
          { senderId: data.trainerid, receiverId: data.userid }
        ]
      }).sort({ timestamp: 1 });


      if (messages) {
        return res
          .status(200)
          .json({ message: "message fetched successfully", messages: messages });
      } else {
        return res
          .status(401)
          .json({ message: "No data provided" });
      }
    } catch (error) {
      console.error('Error in getMessages:', error);
      return res
        .status(401)
        .json({ message: 'An error occurred while processing the request' });
    }
  };

export const getGroupMessagesUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("entered getgroup messages")
      if (!req.body) {
        return res
          .status(500)
          .json({ message: 'Request body is missing' });
      }
      const messages = await GroupMessage.find().sort({ timestamp: 1 });

      
      if (messages) {
        return res
          .status(200)
          .json({ message: "message fetched successfully", messages: messages });
      } else {
        return res
          .status(401)
          .json({ message: "No data provided" });
      }
    } catch (error) {
      console.error('Error in getMessages:', error);
      return res
        .status(401)
        .json({ message: 'An error occurred while processing the request' });
    }
  };



export const getGroupPolls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("entered getgroup messages")
    if (!req.body) {
      return res
        .status(500)
        .json({ message: 'Request body is missing' });
    }
    const pollings = await Poll.find().sort({ timestamp: 1 });
    
    if (pollings) {
      return res
        .status(200)
        .json({ message: "message fetched successfully", polls: pollings });
    } else {
      return res
        .status(401)
        .json({ message: "No data provided" });
    }
  } catch (error) {
    console.error('Error in getMessages:', error);
    return res
      .status(401)
      .json({ message: 'An error occurred while processing the request' });
  }
};


  