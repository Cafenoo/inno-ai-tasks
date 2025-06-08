import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { IsString, IsNotEmpty } from 'class-validator';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  catchPhrase: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  bs: string;

  @OneToOne('User', 'company')
  user: any;
} 