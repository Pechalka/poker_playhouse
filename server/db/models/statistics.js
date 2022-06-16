module.exports = function (sequelize, DataTypes) {
    const Statistics = sequelize.define('Statistics', {
      account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      points:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      win:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }
    });
  
    Statistics.associate = models => {
        Statistics.belongsTo(models.Account, { foreignKey: 'account_id' });
    };
  
    return Statistics;
  };