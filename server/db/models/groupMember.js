
module.exports = function (sequelize, DataTypes) {
  const TABLE_NAME = "groupMember";

  const GroupMember = sequelize.define(TABLE_NAME, {
    group_id: {
      type: DataTypes.INTEGER,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    bankroll: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0.00,
    }
  }, { underscored: true });

  GroupMember.associate = models => {
    GroupMember.belongsTo(models.User, { foreignKey: 'user_id' });
    GroupMember.belongsTo(models.Group, { foreignKey: 'group_id' });
  };

  return GroupMember;
};
