import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { upsertStreamUser } from '../../lib/stream';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);
  private readonly clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const clerkId = payload.sub;

      if (!clerkId) {
        throw new UnauthorizedException('Invalid token payload');
      }

      let user = await this.userService.findByClerkId(clerkId);

      if (!user) {
        const clerkUser = await this.clerkClient.users.getUser(clerkId);
        const name =
          `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
          clerkUser.username ||
          'User';
        const email =
          clerkUser.emailAddresses[0]?.emailAddress ?? `${clerkId}@clerk.dev`;
        const profileImage = clerkUser.imageUrl ?? '';

        try {
          user = await this.userService.create({
            clerkId,
            name,
            email,
            profileImage,
          });
        } catch {
          // A concurrent request can create the same user first.
          user = await this.userService.findByClerkId(clerkId);
          if (!user) {
            throw new UnauthorizedException('User could not be provisioned');
          }
        }

        await upsertStreamUser({
          id: clerkId,
          name,
          image: profileImage,
        });
        this.logger.log(
          `Provisioned user ${clerkId} on first authenticated request`,
        );
      }

      request.user = user;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
