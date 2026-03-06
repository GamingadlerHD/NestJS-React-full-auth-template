import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from './enums/role.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    const adminName = this.configService.get<string>(
      'DEFAULT_ADMIN_NAME',
      'admin',
    );
    const adminPassword = this.configService.get<string>(
      'DEFAULT_ADMIN_PASSWORD',
      'adminpass',
    );

    const existing = await this.findUserByName(adminName);
    if (!existing) {
      await this.createUser(adminName, adminPassword, Role.Admin);
      this.logger.log(`Default admin user "${adminName}" created.`);
    }
  }

  async findUserByName(name: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { name } });
  }

  async hashPassword(password: string): Promise<string> {
    const pepper = this.configService.getOrThrow<string>('PEPPER');
    const saltRounds = 12;
    return bcrypt.hash(password + pepper, saltRounds);
  }

  async createUser(
    name: string,
    password: string,
    role: Role = Role.User,
  ): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    const user = this.usersRepository.create({ name, password: hashedPassword, role });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
