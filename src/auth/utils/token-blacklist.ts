import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private blacklistedTokens: Map<string, number> = new Map();

  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000;

  constructor() {
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  add(token: string, expiresInMs: number = 7 * 24 * 60 * 60 * 1000): void {
    this.blacklistedTokens.set(token, Date.now() + expiresInMs);
    this.logger.log(`Token blacklisted (expires in ${expiresInMs}ms)`);
  }

  isBlacklisted(token: string): boolean {
    const expiry = this.blacklistedTokens.get(token);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.blacklistedTokens.delete(token);
      return false;
    }
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    let count = 0;
    for (const [token, expiry] of this.blacklistedTokens.entries()) {
      if (now > expiry) {
        this.blacklistedTokens.delete(token);
        count++;
      }
    }
    if (count > 0) {
      this.logger.log(`Cleaned up ${count} expired blacklisted tokens`);
    }
  }
}
