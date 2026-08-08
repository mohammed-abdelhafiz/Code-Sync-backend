import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dtos/create-session.dto';
import { User } from '../users/entities/user.entity';
import { chatClient, streamClient } from '../lib/stream';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createSession(sessionData: CreateSessionDto, host: User) {
    const callId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`;
    const session = this.sessionRepository.create({
      ...sessionData,
      host,
      callId,
    });
    const savedSession = await this.sessionRepository.save(session);

    await streamClient.video.call('default', callId).getOrCreate({
      data: {
        created_by_id: host.clerkId,
        custom: {
          problem: sessionData.problem,
          difficulty: sessionData.difficulty,
          sessionId: savedSession.id,
        },
      },
    });
    const channel = chatClient.channel('messaging', callId, {
      created_by_id: host.clerkId,
      members: [host.clerkId],
    });
    await channel.create();
    return savedSession;
  }

  async getActiveSessions() {
    return this.sessionRepository.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async getRecentSessions(user: User) {
    //get session where user is either host or participant
    const sessions = await this.sessionRepository.find({
      where: [
        { status: 'completed', host: { id: user.id } },
        { status: 'completed', participant: { id: user.id } },
      ],
      order: { createdAt: 'DESC' },
      take: 20,
    });
    return sessions;
  }

  async getSession(id: string) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async joinSession(sessionId: string, user: User) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.status === 'completed') {
      throw new BadRequestException('Session is already completed');
    }
    if (session.host?.id === user.id) {
      throw new BadRequestException(
        'Host cannot join their own session as participant',
      );
    }
    if (session.participant) {
      throw new BadRequestException('Session is already having a participant');
    }

    if (session.callId) {
      const channel = chatClient.channel('messaging', session.callId);
      await channel.addMembers([user.clerkId]);
    }

    session.participant = user;
    return this.sessionRepository.save(session);
  }

  async endSession(sessionId: string, user: User) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.status === 'completed') {
      throw new BadRequestException('Session is already completed');
    }
    if (session.host?.id !== user.id) {
      throw new ForbiddenException('Only host can end this session');
    }

    if (session.callId) {
      const call = streamClient.video.call('default', session.callId);
      await call.delete({ hard: true });

      const channel = chatClient.channel('messaging', session.callId);
      await channel.delete();
    }

    session.status = 'completed';
    return this.sessionRepository.save(session);
  }
}
