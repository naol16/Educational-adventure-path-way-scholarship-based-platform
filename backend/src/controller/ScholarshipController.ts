import { Request, Response } from "express";
import { ScholarshipDiscoveryService } from "../services/ScholarshipDiscoveryService.js";
import { ScholarshipSourceRepository } from "../repositories/ScholarshipSourceRepository.js";
import { ScholarshipRepository } from "../repositories/ScholarshipRepository.js";
import { MatchingService } from "../services/MatchingService.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../errors/AppError.js";

export class ScholarshipController {
    /**
     * Manually triggers the scholarship discovery pipeline.
     */
    static triggerDiscovery = catchAsync(async (req: Request, res: Response) => {
        // Run in background to avoid timeout
        ScholarshipDiscoveryService.discoverAll();

        res.status(200).json({
            status: "success",
            message: "Scholarship discovery process started in the background."
        });
    });

    /**
     * Gets all configured scholarship sources.
     */
    static getSources = catchAsync(async (req: Request, res: Response) => {
        const sources = await ScholarshipSourceRepository.findAllActive();
        res.status(200).json({
            status: "success",
            data: sources
        });
    });

    /**
     * Gets matched scholarships for the logged-in student.
     */
    static getMatches = catchAsync(async (req: Request, res: Response) => {
        if (!req.user || !req.user.id) {
            throw new AppError("Unauthorized. User ID missing.", 401);
        }

        try {
            const page = parseInt(req.query.page as string) || 1;
            const pageSize = parseInt(req.query.pageSize as string) || 12;
            const limit = pageSize;
            const offset = (page - 1) * limit;

            const { rows, count } = await MatchingService.getTopMatches(req.user.id, limit, offset);
            
            res.status(200).json({
                status: "success",
                data: rows,
                pagination: {
                    total: count,
                    page,
                    pageSize,
                    totalPages: Math.ceil(count / pageSize)
                }
            });
        } catch (error: any) {
            if (error.message.includes("onboarded")) {
                throw new AppError(error.message, 403);
            }
            if (error.message.includes("not found")) {
                throw new AppError(error.message, 404);
            }
            throw error;
        }
    });

    /**
     * Gets recommended scholarships for the logged-in student.
     */
    static getRecommendations = catchAsync(async (req: Request, res: Response) => {
        if (!req.user || !req.user.id) {
            throw new AppError("Unauthorized. User ID missing.", 401);
        }

        // For now, recommendations use the same matching logic
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 5; // Smaller default for recommendations

        const { rows, count } = await MatchingService.getTopMatches(req.user.id, pageSize, (page - 1) * pageSize);
        
        res.status(200).json({
            status: "success",
            data: rows,
            pagination: {
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize)
            }
        });
    });

    /**
     * Gets a single scholarship with matching details.
     */
    static getDetails = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const userId = (req as any).user?.id;

        if (!userId) throw new AppError("Unauthorized", 401);

        const scholarship = await MatchingService.getMatchById(userId, parseInt(id as string));

        if (!scholarship) {
            throw new AppError("Scholarship not found", 404);
        }

        res.status(200).json({
            status: "success",
            data: scholarship
        });
    });

    /**
     * Lists scholarships with general filters (Explorer).
     */
    static list = catchAsync(async (req: Request, res: Response) => {
        const filters = req.query;
        const { rows, count } = await ScholarshipRepository.findAll(filters);
        
        const page = parseInt(filters.page as string) || 1;
        const pageSize = parseInt(filters.pageSize as string) || 12;

        res.status(200).json({
            status: "success",
            data: rows,
            pagination: {
                total: count,
                page,
                pageSize,
                totalPages: Math.ceil(count / pageSize)
            }
        });
    });

    /**
     * Gets all unique countries present in the scholarship database.
     */
    static getCountries = catchAsync(async (req: Request, res: Response) => {
        const countries = await ScholarshipRepository.getCountries();
        res.status(200).json({
            status: "success",
            data: countries
        });
    });
}
