import { Injectable } from '@nestjs/common';
import { chatClient } from '../lib/stream';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ChatService {
  generateStreamToken(user: User) {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const token = chatClient.createToken(user.clerkId, expiresAt);

    return {
      token,
      user: {
        clerkId: user.clerkId,
        name: user.name,
        profileImage: user.profileImage,
      },
    };
  }
}
