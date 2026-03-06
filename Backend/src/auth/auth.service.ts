import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/users/enums/role.enum';

type AuthInput = {
  username: string;
  password: string;
};
type SignInData = {
  userId: number;
  username: string;
  role: Role;
};
type AuthResult = {
  accessToken: string;
  refreshToken: string;
  userId: number;
  username: string;
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async authenticate(input: AuthInput): Promise<AuthResult> {
    const user = await this.validateUser(input);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.signIn(user);
  }

  async validateUser(input: AuthInput): Promise<SignInData | null> {
    const user = await this.usersService.findUserByName(input.username);
    if (!user) {
      return null;
    }
    const pepper = this.configService.getOrThrow<string>('PEPPER');
    const passwordMatch = await bcrypt.compare(
      input.password + pepper,
      user.password,
    );
    if (passwordMatch) {
      return {
        userId: user.id,
        username: user.name,
        role: user.role,
      };
    }
    return null;
  }

  async signIn(user: SignInData): Promise<AuthResult> {
    const payload = {
      sub: user.userId,
      username: user.username,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
        '7d') as any,
    });

    return {
      accessToken,
      refreshToken,
      userId: user.userId,
      username: user.username,
      role: user.role,
    };
  }
}
