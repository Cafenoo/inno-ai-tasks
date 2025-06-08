import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { Address } from './address.entity';
import { Company } from './company.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  website: string;

  @OneToOne(() => Address, address => address.user, { cascade: true })
  @JoinColumn()
  address: Address;

  @OneToOne(() => Company, company => company.user, { cascade: true })
  @JoinColumn()
  company: Company;
} 