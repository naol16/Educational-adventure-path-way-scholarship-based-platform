import { Request, Response } from "express";
import { Scholarship, Student, Counselor, MarketingTestimonial, MarketingFaq, MarketingStat } from "../models/index.js";

export class MarketingController {
    static async getLandingPageData(req: Request, res: Response) {
        try {
            // Fetch stats from DB
            const dbStats = await MarketingStat.findAll({ order: [['id', 'ASC']] });
            
            let stats;
            if (dbStats.length > 0) {
                // If we have manual overrides in DB, use them
                // But if they have a dbKey, we can still update their value with real counts
                stats = await Promise.all(dbStats.map(async (s) => {
                    if (s.isManual) return { label: s.label, value: s.value };
                    
                    let realValue = s.value;
                    if (s.dbKey === 'scholarships') {
                        const count = await Scholarship.count();
                        realValue = `${count}+`;
                    } else if (s.dbKey === 'counselors') {
                        const count = await Counselor.count({ where: { verificationStatus: 'verified' } });
                        realValue = `${count}+`;
                    } else if (s.dbKey === 'students') {
                        const count = await Student.count();
                        realValue = `${count}+`;
                    }
                    return { label: s.label, value: realValue };
                }));
            } else {
                // Default fallback if table is empty
                const scholarshipCount = await Scholarship.count();
                const counselorCount = await Counselor.count({ where: { verificationStatus: 'verified' } });
                const studentCount = await Student.count();
                
                stats = [
                    { label: "Active Scholarships", value: `${scholarshipCount}+` },
                    { label: "Verified Counselors", value: `${counselorCount}+` },
                    { label: "Students Placed", value: `${studentCount}+` },
                ];
            }

            // Fetch testimonials
            const testimonials = await MarketingTestimonial.findAll();

            // Fetch FAQs
            const faqs = await MarketingFaq.findAll({ order: [['order', 'ASC']] });

            res.status(200).json({
                stats,
                testimonials,
                faqs
            });
        } catch (error: any) {
            console.error("Error fetching landing page data:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}
