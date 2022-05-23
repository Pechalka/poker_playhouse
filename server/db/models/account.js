module.exports = function (sequelize, DataTypes) {
  const TABLE_NAME = "account";

  const Account = sequelize.define(TABLE_NAME, {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.INTEGER,
    },
    tokens: {
      type: DataTypes.INTEGER,
    },
    experience: {
      type: DataTypes.INTEGER,
    },
  }, { underscored: false });

  // Account.associate = (models) => {
    Account.belongsTo(sequelize.models.User, { foreignKey: 'user_id' });
    Account.hasMany(sequelize.models.AccountStatistic, { foreignKey: 'user_id' })
  // };

  return Account;
};
