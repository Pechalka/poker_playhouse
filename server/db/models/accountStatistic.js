const { Model, Optional, ModelAttributes } = require("sequelize");
// const { ModelType } = require ("../ModelType");
// const { AccountStatistic } =  require('entities')

// const STATISTIC_BELONGS_TO_ACCOUNT= "account"

// interface Relations {
//   [STATISTIC_BELONGS_TO_ACCOUNT]: AccountStatisticInstance
// }
// interface AccountStatisticAttributes extends Optional<AccountStatistic,"id"> {
// }

// export interface AccountStatisticInstance
//   extends Model<AccountStatisticAttributes>,
//   AccountStatisticAttributes,Relations {}

// export type AccountStatisticModel = ModelType<AccountStatisticInstance>;

module.exports = function (sequelize, DataTypes) {
  const TABLE_NAME = "accountStatistics";
  const STATISTIC_BELONGS_TO_ACCOUNT= "account";

  // const AccountStatistic  = {
  //   id: {
  //     type: DataTypes.STRING(250),
  //     defaultValue: DataTypes.UUID,
  //     primaryKey: true,
  //     allowNull: false,
  //     unique: true,
  //   },
  //   accountId: { type: DataTypes.UUIDV4, allowNull: false },
  //   balanceBuyIn: { type: DataTypes.DECIMAL(2) },
  //   balanceBuyOut: { type: DataTypes.DECIMAL(2) },
  //   isWon: { type: DataTypes.BOOLEAN },
  //   date: { type: DataTypes.DATE },
  // };

  const AccountStatistic = sequelize.define(TABLE_NAME, {
    id: {
      type: DataTypes.STRING(250),
      defaultValue: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    accountId: { type: DataTypes.UUIDV4, allowNull: false },
    balanceBuyIn: { type: DataTypes.DECIMAL(2) },
    balanceBuyOut: { type: DataTypes.DECIMAL(2) },
    isWon: { type: DataTypes.BOOLEAN },
    date: { type: DataTypes.DATE },
  }, {timestamps: false, underscored: true});
  console.log(typeof AccountStatistic);
  AccountStatistic.associate = (models) =>
    models.AccountStatistic.belongsTo(models.Account, {
      foreignKey: "id",
      as: STATISTIC_BELONGS_TO_ACCOUNT,
    });

  return AccountStatistic;
};
