module.exports = function (sequelize, DataTypes) {
  const TABLE_NAME = "hand";

  const Hand = sequelize.define(TABLE_NAME, {
    history: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  }, { underscored: true });

  Hand.associate = models => {
    Hand.hasMany(models.UserHand, { foreignKey: 'hand_id' });
  };

  return Hand;
};