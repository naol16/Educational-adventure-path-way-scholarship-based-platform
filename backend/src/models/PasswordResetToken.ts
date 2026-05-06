import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Unique,
    ForeignKey,
    BelongsTo,
    Default,
    CreatedAt,
} from "sequelize-typescript";
import { User } from "./User.js";
import type { User as UserType } from "./User.js";

@Table({
    tableName: "password_reset_tokens",
    timestamps: true,
    updatedAt: false,
})
export class PasswordResetToken extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'user_id',
        onDelete: 'CASCADE'
    })
    declare userId: number;

    @BelongsTo(() => User)
    user!: UserType;

    @Unique
    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare token: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
        field: 'expires_at'
    })
    declare expiresAt: Date;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    declare used: boolean;

    @CreatedAt
    @Column({
        type: DataType.DATE,
        field: 'created_at'
    })
    declare createdAt: Date;
}
