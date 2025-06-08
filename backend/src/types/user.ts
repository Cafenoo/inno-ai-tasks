import { User } from '../entities/user.entity';
import { Address } from '../entities/address.entity';
import { Company } from '../entities/company.entity';

export type AddressInput = Omit<Address, 'id' | 'user'>;
export type CompanyInput = Omit<Company, 'id' | 'user'>;
export type UserInput = Omit<User, 'id' | 'address' | 'company'> & {
  address: AddressInput;
  company: CompanyInput;
}; 