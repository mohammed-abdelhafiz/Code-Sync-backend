import { Injectable } from '@nestjs/common';
import { chatClient } from '../lib/stream';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  generateStreamToken(user: User) {
    const token = chatClient.createToken(user.clerkId);
    return { token, user };
  }
}
