import { Op, Sequelize } from "sequelize";
import { Scholarship } from "../models/Scholarship.js";

export class ScholarshipRepository {
    static async findAll(filters: any): Promise<{ rows: Scholarship[]; count: number }> {
        const { query, country, degree_level, fund_type, page = 1, pageSize = 12 } = filters;
        const where: any = {};

        const limit = parseInt(pageSize as string);
        const offset = (parseInt(page as string) - 1) * limit;

        if (query) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${query}%` } },
                { description: { [Op.iLike]: `%${query}%` } }
            ];
        }

        if (country) {
            where.country = { [Op.iLike]: `%${country}%` };
        }

        if (fund_type) {
            where.fundType = { [Op.iLike]: `%${fund_type}%` };
        }

        if (degree_level) {
            where.degreeLevels = {
                [Op.contains]: [degree_level]
            };
        }

        return Scholarship.findAndCountAll({
            where,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });
    }

    static async create(data: Partial<Scholarship>): Promise<Scholarship> {
        return Scholarship.create(data);
    }

    static async existsByOriginalUrl(originalUrl: string): Promise<boolean> {
        const count = await Scholarship.count({ where: { originalUrl } });
        return count > 0;
    }

    static async upsert(data: Partial<Scholarship>): Promise<[Scholarship, boolean | null]> {
        return Scholarship.upsert(data);
    }

    static async getCountries(): Promise<string[]> {
        const scholarships = await Scholarship.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('country')), 'country']],
            where: {
                country: { [Op.ne]: null }
            },
            order: [['country', 'ASC']],
            raw: true
        });

        return scholarships.map((s: any) => s.country);
    }
}
