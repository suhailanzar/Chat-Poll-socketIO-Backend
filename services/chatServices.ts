import { Server as httpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Message } from "../models/Message";
import { GroupMessage } from "../models/groupchat";
import Poll from "../models/groupPolls";
import mongoose from "mongoose";

interface User {
  userId: string;
  role: string;
}

 
export function configureSocket(expressServer: httpServer) {

  const io = new SocketIOServer(expressServer, {
    cors: {
      origin: "https://chat-poll.vercel.app",
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      credentials: true,
    }
  });

  const rooms: Record<string, User[]> = {};
  const broadcasters: Record<string, string> = {};
  io.on("connection", (socket) => {

    // Join a room
    socket.on('joinRoom', (roomId: string) => {
      console.log(`User ${socket.id} joined room ${roomId}`);
      socket.join(roomId);
    });

    // Leave a room
    socket.on('leaveRoom', (roomId: string) => {
      console.log(`User ${socket.id} left room ${roomId}`);
      socket.leave(roomId);

    });

    // Handle sendMessage
    socket.on('sendMessage', async (data: { senderId: string, receiverId: string, message: string }) => {

      const { senderId, receiverId, message } = data;
      console.log('message is ', message);

      // Emit message to the room
      const roomId = getRoomId(senderId, receiverId);

      const newMessage = new Message({ senderId, receiverId, message, roomId });

      await newMessage.save();

      socket.broadcast.to(roomId).emit('receiveMessage', newMessage);
    });

    socket.on('sendMessagetoGroup', async (data: { senderId: string, message: string, polls?: { question: string, options: { option: string }[] } }) => {
      try {
        const { senderId, message, polls } = data;
        const groupId = "communitygroup123"

        console.log('Message received:', message);

        // Create a new message instance
        const newMessage = new GroupMessage({
          groupId,
          senderId,
          message,
          polls: polls ? {
            question: polls.question,
            options: polls.options.map(option => ({ option: option.option, votes: 0 })),
          } : undefined,
          timestamp: new Date(),
        });

        // Save the message to the database
        await newMessage.save();

        // Emit the message to the group room

        socket.broadcast.to(groupId).emit('receiveMessageGroup', newMessage);

      } catch (error) {
        console.error('Error sending message to group:', error);
      }
    });


    socket.on('addpollsUser', async (PollData: any) => {
      try {
        const groupId = "communitygroup123"

        console.log('polldat s servce baend is', PollData);

        // Create a new Poll instance
        const newPoll = new Poll({
          roomId: PollData.roomId,
          senderId: PollData.senderId,
          question: PollData.question,
          options: PollData.options.map((option: { option: string }) => ({
            option: option.option,
            votes: 0
          })),
          createdAt: new Date(),
        });

        // Save the poll to the database
        await newPoll.save();

        socket.broadcast.to(groupId).emit('receivePolls', newPoll);

      } catch (error) {
        console.error('Error sending message to group:', error);
      }
    });

    socket.on('voteOnPoll', async ({ pollId, option,userId }) => {
      console.log('got the poll', pollId, option);
      try {
        const objectId = new mongoose.Types.ObjectId(pollId);
        const poll = await Poll.findOne({ _id: objectId });
        
        if (poll) {
          // Check if the user has already voted
          if (poll.voters.includes(userId)) {
            return; // User has already voted, do nothing
          }
    
          const selectedOption = poll.options.find(o => o.option === option);
          if (selectedOption) {
            selectedOption.votes++;
            poll.voters.push(userId); // Add user to the list of voters
            await poll.save();
          }
        }


      } catch (error) {
        console.error('Error processing vote:', error);
      }
    });


    socket.on("disconnect", () => {
      for (const room in rooms) {
        rooms[room] = rooms[room].filter((user) => user.userId !== socket.id);
        if (rooms[room].length === 0) {
          delete rooms[room];
          delete broadcasters[room];
        } else if (broadcasters[room] === socket.id) {
          delete broadcasters[room];
        }
      }
    });
  });


}

function getRoomId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}