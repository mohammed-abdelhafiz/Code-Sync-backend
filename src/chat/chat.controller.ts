import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { ChatService } from './chat.service';
import type { Request } from 'express';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('token')
  @UseGuards(ClerkAuthGuard)
  getStreamToken(@Req() req: Request) {
    return this.chatService.generateStreamToken(req.user);
  }
}
