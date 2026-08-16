import * as crypto from 'crypto';

let argon2Module: any = null;
try {
  // Safe require guard to prevent serverless function crashes if native C++ binding is missing
  argon2Module = require('argon2');
} catch (err) {
  console.warn(
    '[WARN] Native argon2 binary module unavailable in serverless environment. Falling back to built-in Node.js crypto.scrypt KDF.',
  );
}

export class PasswordUtil {
  /**
   * Hashes a plaintext password using Argon2id (or Node.js crypto.scrypt fallback in serverless).
   */
  static async hashPassword(password: string): Promise<string> {
    if (argon2Module) {
      try {
        return await argon2Module.hash(password, {
          type: argon2Module.argon2id,
          memoryCost: 2 ** 16, // 64 MB
          timeCost: 3,
          parallelism: 1,
        });
      } catch (err) {
        console.warn('[WARN] argon2.hash runtime error; switching to crypto fallback.');
      }
    }

    // Built-in Node.js crypto scrypt fallback
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) return reject(err);
        resolve(`$scrypt$v=1$s=${salt}$h=${derivedKey.toString('hex')}`);
      });
    });
  }

  /**
   * Verifies a candidate password against an Argon2id or scrypt hash.
   */
  static async verifyPassword(hash: string, plainText: string): Promise<boolean> {
    if (hash.startsWith('$scrypt$')) {
      const parts = hash.split('$');
      const salt = parts[3]?.replace('s=', '');
      const storedHex = parts[4]?.replace('h=', '');
      if (!salt || !storedHex) return false;

      return new Promise((resolve) => {
        crypto.scrypt(plainText, salt, 64, (err, derivedKey) => {
          if (err) return resolve(false);
          try {
            const match = crypto.timingSafeEqual(
              Buffer.from(storedHex, 'hex'),
              derivedKey,
            );
            resolve(match);
          } catch {
            resolve(false);
          }
        });
      });
    }

    if (argon2Module) {
      try {
        return await argon2Module.verify(hash, plainText);
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Calculates exact user age from date of birth (dob).
   */
  static calculateAge(dob: Date): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }
}
