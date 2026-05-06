import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    CreatedAt,
    UpdatedAt,
    BelongsTo,
} from "sequelize-typescript";
import { User } from "./User.js";
import type { User as UserType } from "./User.js";

@Table({
    tableName: "ai_chat_messages",
    timestamps: true,
})
export class AIChatMessage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'user_id',
        onDelete: 'CASCADE'
    })
    declare userId?: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        field: 'session_id'
    })
    declare sessionId: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'scholarship_id'
    })
    declare scholarshipId?: number;

    @Column({
        type: DataType.ENUM('user', 'assistant'),
        allowNull: false,
    })
    declare role: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare content: string;

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

    @BelongsTo(() => User)
    user?: User;
}
