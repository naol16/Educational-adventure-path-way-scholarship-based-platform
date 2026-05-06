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
    tableName: "user_warnings",
    timestamps: true,
})
export class UserWarning extends Model {
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

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'admin_id'
    })
    declare adminId: number;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    declare reason: string;

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

    @BelongsTo(() => User, 'user_id')
    user!: User;

    @BelongsTo(() => User, 'admin_id')
    admin!: User;
}
