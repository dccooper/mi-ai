export class RateLimiter {
  private requests: number = 0;
  private lastReset: number = Date.now();
  private limit: number = 60; // requests per minute
  
  canMakeRequest(): boolean {
    const now = Date.now();
    if (now - this.lastReset >= 60000) {
      this.requests = 0;
      this.lastReset = now;
    }
    
    if (this.requests >= this.limit) {
      return false;
    }
    
    this.requests++;
    return true;
  }
} 