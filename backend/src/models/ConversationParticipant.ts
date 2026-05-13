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
import {
  Conversation,
  type Conversation as ConversationType,
} from "./Conversation.js";

@Table({
  tableName: "conversation_participants",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["conversation_id", "user_id"],
    },
  ],
})
export class ConversationParticipant extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Conversation)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "conversation_id",
  })
  declare conversationId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "user_id",
    onDelete: "CASCADE",
  })
  declare userId: number;

  @Default("Member")
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  declare role: "Admin" | "Moderator" | "Member";

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: "is_muted",
  })
  declare isMuted: boolean;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: "created_at",
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: "updated_at",
  })
  declare updatedAt: Date;

  @BelongsTo(() => Conversation)
  conversation!: ConversationType;

  @BelongsTo(() => User)
  user!: UserType;
}
