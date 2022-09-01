import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { ExpressRequest } from '../../../Types/expressRequest';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../../../config';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}
  async use(req: ExpressRequest, _: Response, next: NextFunction) {
    if (!req.headers.authorization) {
      req.user = null;
      next();
      return;
    }
    const token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = verify(token, JWT_SECRET);
      req.user = await this.userService.findById(decoded.id);
      next();
    } catch (e) {
      req.user = null;
      next();
    }
  }
}
