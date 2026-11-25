import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = any>(_err: any, user: any, _info: any, _context: ExecutionContext): TUser {
        // Cho phép đi qua kể cả khi không có user / token không hợp lệ
        return user || null;
    }
}
