import { Request, Response, NextFunction } from 'express';
import { CounselorRepository } from '../repositories/CounselorRepository.js';
import { UserRole } from '../types/userTypes.js';
import { AppError } from '../errors/AppError.js';

/**
 * Middleware to ensure that a counselor has completed their profile onboarding.
 * If not onboarded, it blocks access to core counselor features.
 */
export const requireOnboardedCounselor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    // Only apply to counselors
    if (!user || user.role !== UserRole.COUNSELOR) {
      return next();
    }

    const counselor = await CounselorRepository.findByUserId(user.id);
    
    if (!counselor) {
      throw new AppError("Counselor profile not found.", 404);
    }

    if (!counselor.isOnboarded) {
      // Return a specific error code/message that the frontend can use to redirect
      return res.status(403).json({
        status: 'fail',
        code: 'ONBOARDING_REQUIRED',
        message: 'Please complete your profile onboarding to access this feature.'
      });
    }

    // Attach counselor to request for convenience
    (req as any).counselor = counselor;
    next();
  } catch (error) {
    next(error);
  }
};
