import { Injectable } from '@nestjs/common';
import { chatClient } from 'src/lib/stream';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChatService {
  generateStreamToken(user: User) {
    const token = chatClient.createToken(user.clerkId);
    return { token, user };
  }
}
