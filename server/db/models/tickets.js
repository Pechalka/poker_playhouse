module.exports = function (sequelize, DataTypes) {
  const Ticket = sequelize.define('Ticket', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
	  count: {
      type: DataTypes.INTEGER,
    },
  });

  Ticket.associate = models => {
    Ticket.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return Ticket;
};
