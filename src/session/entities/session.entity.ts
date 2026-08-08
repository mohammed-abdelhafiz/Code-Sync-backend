import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  problem: string;

  @Column({
    type: 'enum',
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  difficulty: 'easy' | 'medium' | 'hard';

  @ManyToOne(() => User, (user) => user.hostedSessions, { eager: true })
  host: User;

  @ManyToOne(() => User, (user) => user.participatedSessions, {
    nullable: true,
    eager: true,
  })
  participant?: User;

  @Column({
    type: 'enum',
    enum: ['active', 'completed'],
    default: 'active',
  })
  status: 'active' | 'completed';

  @Column({ nullable: true })
  callId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
