import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  street: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  suite: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  city: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  zipcode: string;

  @Column('jsonb')
  @IsObject()
  @IsNotEmpty()
  geo: {
    lat: string;
    lng: string;
  };

  @OneToOne('User', 'address')
  user: any;
} 