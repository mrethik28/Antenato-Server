import { ForbiddenException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { AuthDTO } from './dto';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types/tokens.type';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async localSingUp(dto: AuthDTO): Promise<Tokens> {
    const hash = await this.hashData(dto.password);
    const newUser = await this.databaseService.userRegistration.create({
      data: {
        email: dto.email,
        hash: hash,
        role: dto.role,
        hashrt: dto.role,
      },
    });
    const tokens = await this.getTokens(newUser.id, newUser.role);
    await this.updateHashRT(newUser.id, tokens.refreshToken);
    return tokens;
  }
  async localSingIn(dto: AuthDTO): Promise<Tokens> {
    const user = await this.databaseService.userRegistration.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Access Denied: Email not found');
    }
    const passwordmatch = await bcrypt.compare(dto.password, user.hash);
    if (!passwordmatch) {
      throw new ForbiddenException('Access Denied: Wrong password');
    }
    const tokens = await this.getTokens(user.id, user.role);
    await this.updateHashRT(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(user: any): Promise<string> {
    const userId = user.id;
    await this.databaseService.userRegistration.updateMany({
      where: {
        id: userId,
        hashrt: {
          not: null,
        },
      },
      data: {
        hashrt: null,
      },
    });
    return 'Succesfully logged out';
  }
  async refresh(decoded: any) {
    const userId = decoded.sub;
    const refreshToken = decoded.refreshToken;
    const user = await this.databaseService.userRegistration.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new ForbiddenException('Access denied: Invalid Token');
    }

    const rtMatches = await bcrypt.compare(refreshToken, user.hashrt);
    if (!rtMatches) {
      throw new ForbiddenException('Access denied: Invalid Token');
    }

    const tokens = await this.getTokens(userId, user.role);
    await this.updateHashRT(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateHashRT(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.databaseService.userRegistration.update({
      where: { id: userId },
      data: { hashrt: hash },
    });
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, role: Role) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          role,
        },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          role,
        },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
