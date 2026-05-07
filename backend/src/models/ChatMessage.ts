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
    Default,
} from "sequelize-typescript";
import { User } from "./User.js";
import { Conversation } from "./Conversation.js";

@Table({
    tableName: "chat_messages",
    timestamps: true,
})
export class ChatMessage extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @ForeignKey(() => Conversation)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'conversation_id'
    })
    declare conversationId: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'sender_id',
        onDelete: 'CASCADE'
    })
    declare senderId: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare content: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_delivered'
    })
    declare isDelivered: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'delivered_at'
    })
    declare deliveredAt?: Date;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_read'
    })
    declare isRead: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
        field: 'read_at'
    })
    declare readAt?: Date;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_moderated'
    })
    declare isModerated: boolean;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'moderation_reason'
    })
    declare moderationReason?: string;

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

    @BelongsTo(() => Conversation)
    conversation!: Conversation;

    @BelongsTo(() => User)
    sender!: User;
}
