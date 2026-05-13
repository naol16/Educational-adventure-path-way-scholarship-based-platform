import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    CreatedAt,
    UpdatedAt,
    HasMany,
    BelongsToMany,
    Default,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { User, type User as UserType } from "./User.js";
import { ConversationParticipant, type ConversationParticipant as ConversationParticipantType } from "./ConversationParticipant.js";
import { ChatMessage, type ChatMessage as ChatMessageType } from "./ChatMessage.js";

@Table({
    tableName: "conversations",
    timestamps: true,
})
export class Conversation extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    declare id: number;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_group'
    })
    declare isGroup: boolean;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    declare name?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true
    })
    declare description?: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: true
    })
    declare country?: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true
    })
    declare avatar?: string;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        field: 'is_active'
    })
    declare isActive: boolean;

    @Column({
        type: DataType.ENUM('Public', 'Private'),
        allowNull: false,
        defaultValue: 'Public',
        field: 'group_type'
    })
    declare groupType: 'Public' | 'Private';

    @Column({
        type: DataType.STRING(50),
        allowNull: true,
        defaultValue: 'General'
    })
    declare category: string;

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

    @HasMany(() => ChatMessage)
    declare messages: ChatMessageType[];

    @HasMany(() => ConversationParticipant)
    declare participants: ConversationParticipantType[];

    @BelongsToMany(() => User, {
        through: () => ConversationParticipant,
        as: 'members'
    })
    declare members: UserType[];

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'created_by'
    })
    declare createdBy?: number;

    @BelongsTo(() => User, {
        foreignKey: 'created_by',
        as: 'creator'
    })
    creator?: UserType;
}

