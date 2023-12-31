import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from 'src/enums/roles.enum';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  subscriber: string;
  username: string;
  email: string;
  role: Role;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.access_secret'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
