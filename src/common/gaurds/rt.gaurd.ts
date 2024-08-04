import { AuthGuard } from '@nestjs/passport';

export class RTGaurd extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
