import { Sequelize } from "sequelize-typescript";
import { hasVectorExtension } from "../config/sequelize.js";
import { Scholarship } from "../models/Scholarship.js";
import { Student } from "../models/Student.js";
import { MatchedScholarship } from "../types/scholarshipTypes.js";
import { Op } from "sequelize";
import { User } from "../models/User.js";

export class MatchingRepository {
  private static escapeSql(value: string): string {
    return value.replace(/'/g, "''");
  }

  private static normalizeList(input: unknown): string[] {
    if (!input) return [];

    if (Array.isArray(input)) {
      return [
        ...new Set(
          input.map((v) => String(v).trim().toLowerCase()).filter(Boolean),
        ),
      ];
    }

    if (typeof input === "string") {
      const raw = input.trim();
      if (!raw) return [];

      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return [
            ...new Set(
              parsed.map((v) => String(v).trim().toLowerCase()).filter(Boolean),
            ),
          ];
        }
      } catch {
        // fall through to delimiter split
      }

      return [
        ...new Set(
          raw
            .split(/[;,|]/)
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean),
        ),
      ];
    }

    return [];
  }

  private static buildIlikeOr(columnSql: string, terms: string[]): string {
    const clauses = terms.map(
      (term) => `${columnSql} ILIKE '%${this.escapeSql(term)}%'`,
    );
    return clauses.length > 0 ? `(${clauses.join(" OR ")})` : "FALSE";
  }

  private static buildProfileMatchingRules(
    student: Student,
    strict: boolean = true,
  ): {
    whereConditions: any[];
    bonusExpression: string;
  } {
    const whereConditions: any[] = [
      Sequelize.literal(`"Scholarship"."embedding" IS NOT NULL`),
    ];

    const countryTerms = this.normalizeList(
      student.preferredCountries ||
        student.countryInterest ||
        student.countryOfResidence,
    );
    const levelTerms = this.normalizeList(
      student.preferredDegreeLevel ||
        student.degreeSeeking ||
        student.academicStatus,
    );
    const studyTerms = this.normalizeList(
      student.studyPreferences || student.fieldOfStudy || student.researchArea,
    );
    const fundingTerms = this.normalizeList(student.fundingRequirement);
    const intakeTerms = this.normalizeList(student.intakeSeason);

    // Country and level can be strict filters. We relax them automatically if no matches are found.
    if (strict && countryTerms.length > 0) {
      whereConditions.push(
        Sequelize.literal(
          this.buildIlikeOr(
            `COALESCE("Scholarship"."country", '')`,
            countryTerms,
          ),
        ),
      );
    }

    if (strict && levelTerms.length > 0) {
      const levelCondition = this.buildIlikeOr(`LOWER(lvl.value)`, levelTerms);
      whereConditions.push(
        Sequelize.literal(
          `EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE("Scholarship"."degree_levels", '[]'::jsonb)) AS lvl(value) WHERE ${levelCondition})`,
        ),
      );
    }

    const bonusParts: string[] = [];

    if (countryTerms.length > 0) {
      bonusParts.push(
        `CASE WHEN ${this.buildIlikeOr(`COALESCE("Scholarship"."country", '')`, countryTerms)} THEN 10 ELSE 0 END`,
      );
    }

    if (levelTerms.length > 0) {
      const levelCondition = this.buildIlikeOr(`LOWER(lvl.value)`, levelTerms);
      bonusParts.push(
        `CASE WHEN EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE("Scholarship"."degree_levels", '[]'::jsonb)) AS lvl(value) WHERE ${levelCondition}) THEN 12 ELSE 0 END`,
      );
    }

    if (studyTerms.length > 0) {
      const reqOr = this.buildIlikeOr(
        `COALESCE("Scholarship"."requirements", '')`,
        studyTerms,
      );
      const descOr = this.buildIlikeOr(
        `COALESCE("Scholarship"."description", '')`,
        studyTerms,
      );
      const titleOr = this.buildIlikeOr(
        `COALESCE("Scholarship"."title", '')`,
        studyTerms,
      );
      bonusParts.push(
        `CASE WHEN (${reqOr} OR ${descOr} OR ${titleOr}) THEN 8 ELSE 0 END`,
      );
    }

    if (fundingTerms.length > 0) {
      bonusParts.push(
        `CASE WHEN ${this.buildIlikeOr(`COALESCE("Scholarship"."fund_type", '')`, fundingTerms)} THEN 5 ELSE 0 END`,
      );
    }

    if (intakeTerms.length > 0) {
      bonusParts.push(
        `CASE WHEN ${this.buildIlikeOr(`COALESCE("Scholarship"."intake_season", '')`, intakeTerms)} THEN 4 ELSE 0 END`,
      );
    }

    return {
      whereConditions,
      bonusExpression: bonusParts.length > 0 ? bonusParts.join(" + ") : "0",
    };
  }

  /**
   * Executes the optimized pgvector SQL search with hard filters and optional query filters.
   */
  /**
   * Executes the optimized pgvector SQL search with hard filters.
   */
  static async findTopMatches(
    student: Student,
    vectorStr: string,
    limit: number = 5,
    offset: number = 0,
  ): Promise<{ rows: MatchedScholarship[]; count: number }> {
    const queryWithRules = async (strict: boolean) => {
      const { whereConditions, bonusExpression } =
        this.buildProfileMatchingRules(student, strict);
      const vectorScoreExpr = `(1 - ("Scholarship"."embedding" <=> '${vectorStr}'::vector)) * 100`;
      const finalScoreExpr = `LEAST(100, GREATEST(0, ((${vectorScoreExpr}) * 0.8) + (${bonusExpression})))`;

      const count = await Scholarship.count({
        where: { [Op.and]: whereConditions } as any,
      });

      const matches = await Scholarship.findAll({
        where: { [Op.and]: whereConditions } as any,
        attributes: {
          include: [
            [Sequelize.literal(finalScoreExpr), "match_score"],
            [Sequelize.literal(`(${bonusExpression})`), "profile_bonus"],
          ],
        },
        order: [Sequelize.literal(`${finalScoreExpr} DESC`)],
        limit,
        offset,
        raw: true,
      });

      return { matches, count };
    };

    let { matches, count } = await queryWithRules(true);

    // Safety fallback: if strict country/degree filters exclude everything,
    // relax filters but keep profile bonuses so users still get personalized results.
    if (count === 0) {
      ({ matches, count } = await queryWithRules(false));
    }

    const mappedRows = matches.map((m) => {
      const score = parseFloat((m as any).match_score?.toString() || "0");
      return {
        ...m,
        match_score: score,
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
    const { bonusExpression } = this.buildProfileMatchingRules(student);
    const vectorScoreExpr = hasVector
      ? `((1 - ("Scholarship"."embedding" <=> '${vectorStr}'::vector)) * 100)`
      : "0";
    const finalScoreExpr = `LEAST(100, GREATEST(0, ((${vectorScoreExpr}) * 0.8) + (${bonusExpression})))`;

    const scholarship = await Scholarship.findByPk(scholarshipId, {
      attributes: {
        include: [
          [Sequelize.literal(finalScoreExpr), "match_score"],
          [Sequelize.literal(`(${bonusExpression})`), "profile_bonus"],
        ],
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
          Sequelize.literal(
            `(1 - (embedding <=> '${scholarshipEmbedding}'::vector)) * 100 > ${threshold}`,
          ),
        ],
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
