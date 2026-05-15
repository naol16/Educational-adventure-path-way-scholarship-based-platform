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
import { User, type User as UserType } from "./User.js";
import { Conversation, type Conversation as ConversationType } from "./Conversation.js";

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

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        field: 'attachment_url'
    })
    declare attachmentUrl?: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        field: 'attachment_type'
    })
    declare attachmentType?: string;

    @ForeignKey(() => ChatMessage)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'reply_to_id',
        onDelete: 'CASCADE'
    })
    declare replyToId?: number;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_edited'
    })
    declare isEdited: boolean;

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
    conversation!: ConversationType;

    @BelongsTo(() => User, { as: 'sender' })
    declare sender: UserType;

    @BelongsTo(() => ChatMessage, { foreignKey: 'reply_to_id', as: 'repliedTo' })
    repliedTo?: ChatMessage;
}
