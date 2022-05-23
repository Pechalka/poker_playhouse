module.exports = function(sequelize, DataTypes) {
  const TABLE_NAME = "user_hand";

  const UserHand = sequelize.define(TABLE_NAME, {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    hand_id: {
      type: DataTypes.INTEGER,
    },
  }, { underscored: true });

  UserHand.associate = models => {
    UserHand.belongsTo(models.User, { foreignKey: 'user_id' })
    UserHand.belongsTo(models.Hand, { foreignKey: 'hand_id' })
  };

  return UserHand;
};