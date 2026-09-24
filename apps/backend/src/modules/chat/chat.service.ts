import { Injectable } from '@nestjs/common';
import { Message } from './chat.schema';

@Injectable()
export class ChatService {
  private messages: any[] = [];

  async getHistory(roomId: string, limit = 50): Promise<Message[]> {
    return this.messages
      .filter((m) => m.roomId === roomId)
      .slice(-limit);
  }

  async getRecentChats(userId: string): Promise<any[]> {
    // Find all messages where senderId or receiverId matches (wait, messages don't store receiverId natively, only roomId)
    // roomId is constructed as "userId1_userId2". We can parse it.
    const userRooms = this.messages.filter(m => m.roomId.includes(userId));
    
    const partnersMap = new Map<string, any>();
    
    for (const msg of userRooms) {
      // Find the partner ID
      const ids = msg.roomId.split('_');
      const partnerId = ids[0] === userId ? ids[1] : ids[0];
      
      if (partnerId === userId) continue;
      
      if (!partnersMap.has(partnerId)) {
        // We need a name. If the partner sent a message, their name is senderName.
        let partnerName = 'Người dùng';
        if (msg.senderId === partnerId) partnerName = msg.senderName;
        else {
          // If we sent the message, we might not know the partner's name unless they also sent one.
          // Let's try to find if they ever sent a message in this room
          const partnerMsg = userRooms.find(m => m.senderId === partnerId);
          if (partnerMsg) partnerName = partnerMsg.senderName;
        }

        partnersMap.set(partnerId, {
          id: partnerId,
          name: partnerName,
          email: '',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
          role: 'PLAYER',
          lastMessage: msg
        });
      } else {
        const p = partnersMap.get(partnerId);
        if (msg.createdAt > p.lastMessage.createdAt) {
          p.lastMessage = msg;
        }
      }
    }
    
    return Array.from(partnersMap.values()).sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);
  }

  async saveMessage(
    roomId: string,
    senderId: string,
    senderName: string,
    content: string,
  ): Promise<Message> {
    const newMessage = {
      _id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      roomId,
      senderId,
      senderName,
      content,
      createdAt: new Date(),
    };
    
    this.messages.push(newMessage);
    return newMessage as any;
  }
}
