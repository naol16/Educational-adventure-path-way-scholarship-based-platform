import { MigrationInterface, QueryInterface } from 'sequelize';

export const AddMissingColumnsToChatMessages: MigrationInterface = {
  name: 'AddMissingColumnsToChatMessages',
  async up(queryInterface: QueryInterface) {
    // Check if columns exist before adding (idempotent)
    const tableExists = await queryInterface.sequelize.query('SELECT to_regclass(\'chat_messages\')');
    const tableName = (tableExists[0][0]?.to_regclass) || 'chat_messages';

    // Add is_delivered
    await queryInterface.addColumn(tableName, 'is_delivered', {
      type: 'BOOLEAN',
      allowNull: false,
      defaultValue: false,
    });

    // Add delivered_at
    await queryInterface.addColumn(tableName, 'delivered_at', {
      type: 'DATE',
      allowNull: true,
    });

    // Add is_read
    await queryInterface.addColumn(tableName, 'is_read', {
      type: 'BOOLEAN',
      allowNull: false,
      defaultValue: false,
    });

    // Add read_at
    await queryInterface.addColumn(tableName, 'read_at', {
      type: 'DATE',
      allowNull: true,
    });

    // Add is_moderated
    await queryInterface.addColumn(tableName, 'is_moderated', {
      type: 'BOOLEAN',
      allowNull: false,
      defaultValue: false,
    });

    // Add moderation_reason
    await queryInterface.addColumn(tableName, 'moderation_reason', {
      type: 'VARCHAR(255)',
      allowNull: true,
    });

    // Add parent_id (if not already added)
    await queryInterface.addColumn(tableName, 'parent_id', {
      type: 'INTEGER',
      allowNull: true,
      references: { model: 'chat_messages', key: 'id' },
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface: QueryInterface) {
    const tableExists = await queryInterface.sequelize.query('SELECT to_regclass(\'chat_messages\')');
    const tableName = (tableExists[0][0]?.to_regclass) || 'chat_messages';

    await queryInterface.removeColumn(tableName, 'is_delivered');
    await queryInterface.removeColumn(tableName, 'delivered_at');
    await queryInterface.removeColumn(tableName, 'is_read');
    await queryInterface.removeColumn(tableName, 'read_at');
    await queryInterface.removeColumn(tableName, 'is_moderated');
    await queryInterface.removeColumn(tableName, 'moderation_reason');
    await queryInterface.removeColumn(tableName, 'parent_id');
  }
};
