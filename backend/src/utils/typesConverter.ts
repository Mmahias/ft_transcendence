import { ChanMode } from '@ft-transcendence/shared/types';
import { PrismaChanMode } from '@prisma/client';

// Convert TypeScript enum to its string representation for Prisma
export function toPrismaEnum(value: ChanMode): PrismaChanMode {
  switch (value) {
    case ChanMode.PUBLIC:
      return PrismaChanMode.PUBLIC;
    case ChanMode.PRIVATE:
      return PrismaChanMode.PRIVATE;
    case ChanMode.PROTECTED:
      return PrismaChanMode.PROTECTED;
    case ChanMode.DM:
      return PrismaChanMode.DM;
    default:
      throw new Error("Invalid ChanMode value");
  }
}

export function fromPrismaEnum(value: PrismaChanMode): ChanMode {
  switch (value) {
    case PrismaChanMode.PUBLIC:
      return ChanMode.PUBLIC;
    case PrismaChanMode.PRIVATE:
      return ChanMode.PRIVATE;
    case PrismaChanMode.PROTECTED:
      return ChanMode.PROTECTED;
    case PrismaChanMode.DM:
      return ChanMode.DM;
    default:
      throw new Error("Invalid PrismaChanMode value");
  }
}
