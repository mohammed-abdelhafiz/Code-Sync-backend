import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dtos/create-session.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import type { Request } from 'express';

@Controller('session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @UseGuards(ClerkAuthGuard)
  createSession(@Req() req: Request, @Body() body: CreateSessionDto) {
    return this.sessionService.createSession(body, req.user);
  }

  @Get('active')
  @UseGuards(ClerkAuthGuard)
  getActiveSessions() {
    return this.sessionService.getActiveSessions();
  }

  @Get('recent')
  @UseGuards(ClerkAuthGuard)
  getRecentSessions(@Req() req: Request) {
    return this.sessionService.getRecentSessions(req.user);
  }

  @Get(':id')
  @UseGuards(ClerkAuthGuard)
  getSession(@Param('id') id: string) {
    return this.sessionService.getSession(id);
  }

  @Post(':id/join')
  @UseGuards(ClerkAuthGuard)
  joinSession(@Param('id') id: string, @Req() req: Request) {
    return this.sessionService.joinSession(id, req.user);
  }

  @Post(':id/end')
  @UseGuards(ClerkAuthGuard)
  endSession(@Param('id') id: string, @Req() req: Request) {
    return this.sessionService.endSession(id, req.user);
  }
}
