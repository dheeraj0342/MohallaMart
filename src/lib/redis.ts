// Redis configuration and utilities
// Only import Redis on server-side
let Redis: typeof import("ioredis").default | undefined;
if (typeof window === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Redis = require("ioredis").default;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  retryDelayOnFailover: number;
  maxRetriesPerRequest: number;
  lazyConnect: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RedisClient = any;

class RedisService {
  private client: RedisClient;
  private config: RedisConfig;

  constructor() {
    this.config = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    // Only create Redis client on server-side
    if (typeof window === "undefined" && Redis) {
      this.client = new Redis(this.config);
    } else {
      // Create a mock client for browser
      this.client = {
        on: () => {},
        get: () => Promise.resolve(null),
        set: () => Promise.resolve("OK"),
        del: () => Promise.resolve(0),
        exists: () => Promise.resolve(0),
        expire: () => Promise.resolve(0),
        ttl: () => Promise.resolve(-1),
        incr: () => Promise.resolve(0),
        decr: () => Promise.resolve(0),
        mget: () => Promise.resolve([]),
        mset: () => Promise.resolve("OK"),
        keys: () => Promise.resolve([]),
        quit: () => Promise.resolve("OK"),
        status: "ready",
      };
    }

    // Handle connection events
    this.client.on("connect", () => {
      console.log("Redis connected");
    });

    this.client.on("error", (error: unknown) => {
      console.error("Redis error:", error);
    });

    this.client.on("close", () => {
      console.log("Redis connection closed");
    });
  }

  // Get a value by key
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  // Set a value with optional expiration
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      console.error("Redis set error:", error);
      return false;
    }
  }

  // Delete a key
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error("Redis delete error:", error);
      return false;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("Redis exists error:", error);
      return false;
    }
  }

  // Set expiration for a key
  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      console.error("Redis expire error:", error);
      return false;
    }
  }

  // Get TTL for a key
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error("Redis TTL error:", error);
      return -1;
    }
  }

  // Increment a numeric value
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      console.error("Redis incr error:", error);
      return 0;
    }
  }

  // Decrement a numeric value
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      console.error("Redis decr error:", error);
      return 0;
    }
  }

  // Get multiple keys
  async mget(keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(...keys);
    } catch (error) {
      console.error("Redis mget error:", error);
      return keys.map(() => null);
    }
  }

  // Set multiple key-value pairs
  async mset(keyValuePairs: Record<string, string>): Promise<boolean> {
    try {
      await this.client.mset(keyValuePairs);
      return true;
    } catch (error) {
      console.error("Redis mset error:", error);
      return false;
    }
  }

  // Get all keys matching a pattern
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      console.error("Redis keys error:", error);
      return [];
    }
  }

  // Cache a function result
  async cache<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      // Execute function and cache result
      const result = await fn();
      await this.set(key, JSON.stringify(result), ttlSeconds);
      return result;
    } catch (error) {
      console.error("Redis cache error:", error);
      // Fallback to executing function without caching
      return await fn();
    }
  }

  // Get or set a value with expiration
  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    try {
      const cached = await this.get(key);
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await fn();
      await this.set(key, JSON.stringify(result), ttlSeconds);
      return result;
    } catch (error) {
      console.error("Redis getOrSet error:", error);
      return await fn();
    }
  }

  // Clear cache by pattern
  async clearCache(pattern: string): Promise<number> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;

      const result = await this.client.del(...keys);
      return result;
    } catch (error) {
      console.error("Redis clearCache error:", error);
      return 0;
    }
  }

  // Get client status
  getStatus(): string {
    return this.client.status;
  }

  // Close connection
  async close(): Promise<void> {
    await this.client.quit();
  }
}

// Export singleton instance
export const redisService = new RedisService();

// Types are already exported as interfaces above
