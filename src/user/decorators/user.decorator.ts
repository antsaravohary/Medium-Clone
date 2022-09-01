import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { factory } from 'ts-jest/dist/transformers/hoist-jest';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!request) {
    return null;
  }
  if (data) {
    return request.user[data];
  }
  return request.user;
});
