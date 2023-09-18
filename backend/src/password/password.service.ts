import { Injectable } from '@nestjs/common';
import { scrypt as scryptCb, randomBytes } from 'crypto';

// hashing algorithm used is 'scrypt'

const SCRYPT_PARAMS = {
  N: 16384,     // CPU/memory cost parameter. Must be a power of 2.
  r: 8,         // block size parameter
  p: 1,         // parallelization parameter
  dkLen: 64,    // derived key length in bytes
  maxmem: 0     // maximum memory (in bytes) to use
};

@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = randomBytes(16).toString('hex');
      scryptCb(password, salt, SCRYPT_PARAMS.dkLen, SCRYPT_PARAMS, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(`${salt}$${derivedKey.toString('hex')}`);
      });
    });
  }

  async verifyPassword(storedPassword: string, providedPassword: string): Promise<boolean> {
    const [salt, key] = storedPassword.split('$');
    
    return new Promise((resolve, reject) => {
      scryptCb(providedPassword, salt, SCRYPT_PARAMS.dkLen, SCRYPT_PARAMS, (err, derivedKey) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(key === derivedKey.toString('hex'));
      });
    });
  }
}