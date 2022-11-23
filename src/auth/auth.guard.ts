import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard as PassportGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard extends PassportGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();

    const allowAny = this.reflector.get(
        'allow-any',
        context.getHandler(),
    );

    if (user) {
      return user;
    }

    if (allowAny) {
      return true;
    }

    throw new UnauthorizedException();
  }
}