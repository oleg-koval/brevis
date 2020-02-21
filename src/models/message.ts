import { Schema, model } from 'mongoose';

const MessageSchema = new Schema({
  message: String,
});

export const MessageModel = model('Message', MessageSchema);
