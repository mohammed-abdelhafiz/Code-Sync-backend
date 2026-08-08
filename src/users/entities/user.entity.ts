import { Session } from 'src/session/entities/session.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: '' })
  profileImage: string;

  @Column({ unique: true })
  clerkId: string;

  @OneToMany(() => Session, (session) => session.host)
  hostedSessions: Session[];

  @OneToMany(() => Session, (session) => session.participant)
  participatedSessions: Session[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
