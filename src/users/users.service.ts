import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async findByClerkId(clerkId: string) {
    return this.usersRepo.findOneBy({ clerkId });
  }

  create(createUserDto: Partial<User>) {
    return this.usersRepo.save(createUserDto);
  }

  remove(clerkId: string) {
    return this.usersRepo.delete({ clerkId });
  }
}
