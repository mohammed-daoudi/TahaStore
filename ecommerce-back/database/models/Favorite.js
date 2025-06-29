const { DataTypes } = require('sequelize');

let Favorite = null;

const defineFavorite = async (sequelize) => {
  if (Favorite) {
    return Favorite;
  }

  Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    }
  }, {
    tableName: 'favorites',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['product_id']
      },
      {
        unique: true,
        fields: ['user_id', 'product_id']
      }
    ]
  });

  return Favorite;
};

module.exports = { defineFavorite }; 