import { Schema, model, Document, Types } from 'mongoose';

interface Option {
  option: string;
  votes: number;
}

interface PollDocument extends Document {
  question: string;
  options: Option[];
  voters: Types.ObjectId[]; // Array of ObjectIds to track voters
  senderId: Types.ObjectId;
  roomId: string;
  createdAt: Date;
  updatedAt: Date;
}

const OptionSchema = new Schema<Option>({
  option: { type: String },
  votes: { type: Number, default: 0 },
});

const PollSchema = new Schema<PollDocument>(
  {
    question: { type: String, required: true },
    options: { type: [OptionSchema] },
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Array of ObjectIds for tracking voters
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roomId: { type: String, required: true }, // Reference to the chat room
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const Poll = model<PollDocument>('Poll', PollSchema);

export default Poll;
