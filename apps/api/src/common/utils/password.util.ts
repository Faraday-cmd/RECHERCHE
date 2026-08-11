import * as argon2 from 'argon2';

export class PasswordUtil {
  /**
   * Hashes a plaintext password using Argon2id with secure memory and time cost settings.
   * Plaintext passwords must NEVER be logged or stored.
   */
  static async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verifies a candidate password against an Argon2id hash.
   * Constant-time comparison executed inside argon2.verify prevents timing attacks.
   */
  static async verifyPassword(hash: string, plainText: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainText);
    } catch {
      return false;
    }
  }

  /**
   * Calculates exact user age from date of birth (dob).
   * Prevents client-side manipulation of user age.
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
