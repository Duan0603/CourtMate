import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<Message>,
  ) {}

  async getHistory(roomId: string, limit = 50): Promise<Message[]> {
    return this.messageModel
      .find({ roomId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  }

  async saveMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    content: string,
  ): Promise<Message> {
    const newMessage = new this.messageModel({
      roomId,
      senderId,
      senderName,
      content,
    });
    return newMessage.save();
  }
}
