import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { CardStatus, CardType, Currency, Provider } from '../credit-card.enum';

import { User } from '../../user/entities/user.entity';

@Entity()
export class CreditCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Provider })
  provider: Provider;

  @Column({ type: 'enum', enum: CardType })
  type: CardType;

  @Column()
  cardNumber: string;

  @Column()
  cvv: string;

  @Column({ default: 1000 })
  balance: number;

  @Column({ type: 'enum', enum: Currency, default: Currency.PLN })
  currency: Currency;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.ACTIVE })
  cardStatus: CardStatus;

  @CreateDateColumn({ type: 'date' })
  issued: Date;

  @ManyToOne(() => User, (user) => user.creditCards)
  user: User;
}
