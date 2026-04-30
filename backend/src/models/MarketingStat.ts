import {
    Table,
    Column,
    Model,
    DataType,
    CreatedAt,
    UpdatedAt,
} from "sequelize-typescript";

@Table({
    tableName: "marketing_stats",
    timestamps: true,
})
export class MarketingStat extends Model {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare label: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare value: string;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    declare isManual: boolean; // If true, use 'value' as is. If false, calculate from DB.

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare dbKey: string; // e.g., 'scholarships', 'counselors', 'students'

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
}
