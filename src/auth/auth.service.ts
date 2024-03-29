import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { IUserState, JwtResponse } from './auth.interface';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: CreateUserDto): Promise<any> {
    const userExists = await this.userService.findByEmail(dto.email);
    if (userExists) {
      throw new BadRequestException('User with that e-mail already exists.');
    }

    const hash = await this.hashData(dto.password);
    const user = await this.userService.createUser({
      ...dto,
      password: hash,
    });

    const tokens = await this.returnTokens(user);

    return tokens;
  }

  async signIn(dto: SignInDto): Promise<any> {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User with that email does not exist.');
    }
    const passwordMatch = await argon2.verify(user.password, dto.password);
    if (!passwordMatch) {
      throw new BadRequestException('Password is incorrect.');
    }

    const tokens = await this.returnTokens(user);

    return tokens;
  }

  async signOut(userId: number) {
    return this.userService.updateUser(userId, { refreshToken: null });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashRefreshToken = await this.hashData(refreshToken);
    await this.userService.updateUser(+userId, {
      refreshToken: hashRefreshToken,
    });
  }

  async getTokens(jwt: JwtResponse) {
    const { userId, email, username, role } = jwt;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          subscriber: userId,
          email,
          username,
          role,
        },
        {
          secret: this.configService.get<string>('jwt.access_secret'),
          expiresIn: '30m',
        },
      ),
      this.jwtService.signAsync(
        {
          subscriber: userId,
          email,
          username,
          role,
        },
        {
          secret: this.configService.get<string>('jwt.refresh_secret'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const tokenMatches = await argon2.verify(user.refreshToken, refreshToken);

    if (!tokenMatches) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this.returnTokens(user);

    return tokens;
  }

  async returnTokens(user: User) {
    const jwt = {
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    const tokens = await this.getTokens(jwt);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}
