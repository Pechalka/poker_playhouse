const TABLE_NAME = "group";

module.exports = function (sequelize, DataTypes) {
  const Group = sequelize.define(TABLE_NAME, {
    creator_id: {
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, { underscored: true });

  Group.associate = models => {
    Group.hasMany(models.GroupMember, { foreignKey: 'group_id' });
    Group.hasMany(models.GroupInvite, { foreignKey: 'group_id', as: 'group_invites' });
  };;

  return Group;
};
