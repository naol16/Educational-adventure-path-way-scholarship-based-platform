import { Sequelize } from "sequelize-typescript";
import { hasVectorExtension } from "../config/sequelize.js";
import { Scholarship } from "../models/Scholarship.js";
import { Student } from "../models/Student.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { Op } from "sequelize";
import { User } from "../models/User.js";

export class MatchingRepository {
  /**
   * Executes the optimized pgvector SQL search with hard filters and optional query filters.
   */
  /**
   * Executes the optimized pgvector SQL search with hard filters.
   */
  static async findTopMatches(student: Student, vectorStr: string, limit: number = 5, offset: number = 0): Promise<{ rows: MatchedScholarship[]; count: number }> {
    const whereConditions: any[] = [
      { applicationUrl: { [Op.ne]: null } }
    ];

    // First get the total count of potential matches
    const count = await Scholarship.count({
      where: whereConditions.length > 0 ? { [Op.and]: whereConditions } as any : {}
    });

    const matches = await Scholarship.findAll({
      where: whereConditions.length > 0
        ? { [Op.and]: whereConditions } as any
        : {},
      attributes: {
        include: [
          [
            Sequelize.literal(`(1 - (embedding <=> '${vectorStr}'::vector)) * 100`),
            'match_score'
          ]
        ]
      },
      order: [
        Sequelize.literal(`embedding <=> '${vectorStr}' ASC`)
      ],
      limit,
      offset,
      raw: true
    });

    const mappedRows = matches.map(m => {
      const score = parseFloat((m as any).match_score?.toString() || "0");
      return {
        ...m,
        applicationUrl: (m as any).application_url || (m as any).applicationUrl,
        originalUrl: (m as any).original_url || (m as any).originalUrl,
        match_score: score
      };
    }) as unknown as MatchedScholarship[];

    return { rows: mappedRows, count };
  }

  /**
   * Gets a single scholarship with its calculated vector match score.
   */
  static async findMatchWithScore(
    student: Student,
    scholarshipId: number,
    vectorStr: string,
  ): Promise<MatchedScholarship | null> {
    const hasVector = hasVectorExtension && vectorStr && vectorStr.length > 5;

    const scholarship = await Scholarship.findByPk(scholarshipId, {
      attributes: {
        include: hasVector
          ? [
            [
              Sequelize.literal(
                `((1 - (embedding <=> '${vectorStr}'::vector)) * 100)`,
              ),
              "match_score",
            ],
          ]
          : [[Sequelize.literal("0"), "match_score"]],
      },
    });

    if (!scholarship) return null;

    const data = scholarship.get({ plain: true });
    return {
      ...data,
      match_score: parseFloat(
        (scholarship as any).getDataValue("match_score")?.toString() || "0",
      ),
    } as any;
  }

  /**
   * Finds top students for a given scholarship.
   */
  static async findTopMatchingStudentsForScholarship(
    scholarshipEmbedding: string,
    limit: number = 5,
  ): Promise<any[]> {
    // Query students whose embedding is closest to the scholarship
    // We join Users to get email/name
    const students = await Student.findAll({
      where: Sequelize.literal("embedding IS NOT NULL") as any,
      attributes: [
        "id",
        "userId",
        [
          Sequelize.literal(
            `(1 - (embedding <=> '${scholarshipEmbedding}'::vector)) * 100`,
          ),
          "match_score",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["name", "email", "fcmToken"],
        },
      ],
      order: [
        Sequelize.literal(
          `embedding <=> '${scholarshipEmbedding}'::vector ASC`,
        ),
      ],
      limit: limit,
      raw: true,
      nest: true,
    });

    return students;
  }
  /**
   * Finds all students whose profile matches the given scholarship embedding above a certain score.
   */
  static async findStudentsExceedingThreshold(
    scholarshipEmbedding: string,
    threshold: number = 75,
  ): Promise<any[]> {
    const students = await Student.findAll({
      where: {
        [Op.and]: [
          Sequelize.literal("embedding IS NOT NULL"),
          Sequelize.literal(`(1 - (embedding <=> '${scholarshipEmbedding}'::vector)) * 100 > ${threshold}`)
        ]
      } as any,
      attributes: [
        "id",
        "userId",
        [
          Sequelize.literal(
            `(1 - (embedding <=> '${scholarshipEmbedding}'::vector)) * 100`,
          ),
          "match_score",
        ],
      ],
      include: [
        {
          model: User,
          attributes: ["name", "email", "fcmToken"],
        },
      ],
      raw: true,
      nest: true,
    });

    return students;
  }
}
