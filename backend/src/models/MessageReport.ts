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
import { ChatMessage } from "./ChatMessage.js";

@Table({
    tableName: "message_reports",
    timestamps: true,
})
export class MessageReport extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => ChatMessage)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'message_id'
    })
    declare messageId: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'reporter_id'
    })
    declare reporterId: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare reason: string;

    @Column({
        type: DataType.ENUM('PENDING', 'RESOLVED', 'DISMISSED'),
        defaultValue: 'PENDING',
        allowNull: false
    })
    declare status: string;

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

    @BelongsTo(() => ChatMessage)
    message!: ChatMessage;

    @BelongsTo(() => User)
    reporter!: User;
}
