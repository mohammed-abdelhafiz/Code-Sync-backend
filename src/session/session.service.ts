import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { CreateSessionDto } from './dtos/create-session.dto';
import { User } from 'src/users/entities/user.entity';
import { chatClient, streamClient } from 'src/lib/stream';

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
    await streamClient.video.call('default', callId).getOrCreate({
      data: {
        created_by_id: host.clerkId,
        custom: {
          problem: sessionData.problem,
          difficulty: sessionData.difficulty,
          sessionId: session.id,
        },
      },
    });
    const channel = chatClient.channel('messaging', callId, {
      created_by_id: host.clerkId,
      members: [host.clerkId],
    });
    await channel.create();
    return this.sessionRepository.save(session);
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
        { status: 'completed', host: user },
        { status: 'completed', participant: user },
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
    if (session.participant) {
      throw new BadRequestException('Session is already having a participant');
    }

    const channel = chatClient.channel('messaging', session.callId);
    await channel.addMembers([user.clerkId]);
    return this.sessionRepository.update(sessionId, {
      participant: user,
    });
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
    if (session.host.id !== user.id) {
      throw new BadRequestException('Only host can end this session');
    }

    const call = streamClient.video.call('default', session.callId as string);
    await call.delete({ hard: true });

    const channel = chatClient.channel('messaging', session.callId);
    await channel.delete();

    return this.sessionRepository.update(sessionId, { status: 'completed' });
  }
}
