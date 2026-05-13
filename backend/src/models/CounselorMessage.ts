import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { User, type User as UserType } from "./User.js";

@Table({
  tableName: "counselor_messages",
  timestamps: true,
})
export class CounselorMessage extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "sender_user_id",
    onDelete: "CASCADE",
  })
  declare senderUserId: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: "recipient_user_id",
    onDelete: "CASCADE",
  })
  declare recipientUserId: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: "body",
  })
  declare body: string;

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

  @BelongsTo(() => User, { foreignKey: "senderUserId", as: "sender" })
  sender!: UserType;

  @BelongsTo(() => User, { foreignKey: "recipientUserId", as: "recipient" })
  recipient!: UserType;
}
