import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    Default,
    HasMany,
    HasOne,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";
import { RefreshToken, type RefreshToken as RefreshTokenType } from "./RefreshToken.js";
import { PasswordResetToken, type PasswordResetToken as PasswordResetTokenType } from "./PasswordResetToken.js";
import { Consultation, type Consultation as ConsultationType } from "./Consultation.js";
import { Counselor, type Counselor as CounselorType } from "./Counselor.js";
import { Student, type Student as StudentType } from "./Student.js";
import { Notification, type Notification as NotificationType } from "./Notification.js";
import { UserRole } from "../types/userTypes.js";
import type { UserRole as UserRoleType } from "../types/userTypes.js";

@Table({
    tableName: "users",
    timestamps: true,
})
export class User extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare name: string;

    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare email: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    declare password?: string;

    @Unique
    @Column({
        type: DataType.STRING(100),
        allowNull: true,
        field: 'google_id'
    })
    declare googleId?: string;

    @Default(UserRole.STUDENT)
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [[UserRole.STUDENT, UserRole.COUNSELOR, UserRole.ADMIN]],
        },
    })
    declare role: UserRole;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    })
    declare isActive: boolean;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_verified'
    })
    declare isVerified: boolean;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;

    @UpdatedAt
    @Column({
        type: DataType.DATE,
        field: 'updated_at'
    })
    declare updatedAt: Date;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'avatar_url'
    })
    declare avatarUrl?: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'fcm_token'
    })
    declare fcmToken?: string;

    @Column({
        type: DataType.STRING(10),
        allowNull: true,
        field: 'verification_code'
    })
    declare verificationCode?: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'verification_code_expires'
    })
    declare verificationCodeExpires?: Date;



    // Associations
    @HasMany(() => RefreshToken, { onDelete: 'CASCADE' })
    refreshTokens!: RefreshTokenType[];

    @HasMany(() => PasswordResetToken, { onDelete: 'CASCADE' })
    passwordResetTokens!: PasswordResetTokenType[];

    @HasMany(() => Consultation, { foreignKey: 'student_id', onDelete: 'CASCADE' })
    consultationsAsStudent!: ConsultationType[];

    @HasMany(() => Consultation, { foreignKey: 'counselor_id', onDelete: 'CASCADE' })
    consultationsAsCounselor!: ConsultationType[];

    @HasOne(() => Counselor, { onDelete: 'CASCADE' })
    counselor!: CounselorType;

    @HasOne(() => Student, { onDelete: 'CASCADE' })
    student!: StudentType;

    @HasMany(() => Notification, { onDelete: 'CASCADE' })
    notifications!: NotificationType[];
}
