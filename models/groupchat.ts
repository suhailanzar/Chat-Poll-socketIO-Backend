import mongoose, { Schema, Document } from 'mongoose';

interface IGroupMessage extends Document {
  groupId: string;
  senderId: string;
  message: string;
  timestamp: Date;
}


const GroupMessageSchema: Schema = new Schema({
  groupId: { type: String, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const GroupMessage = mongoose.model<IGroupMessage>('GroupMessage', GroupMessageSchema);
