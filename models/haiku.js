module.exports = function (sequelize, DataTypes) {

    const haiku = sequelize.define("Haiku", {
      author: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      words: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      color1: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      color2: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      
    });
    return haiku;
  };
  