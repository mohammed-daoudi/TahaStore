const { DataTypes } = require('sequelize');

let Address = null;

const defineAddress = async (sequelize) => {
  if (Address) {
    return Address;
  }

  Address = sequelize.define('Address', {
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
    type: {
      type: DataTypes.ENUM('facturation', 'livraison'),
      allowNull: false
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    prenom: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    adresse: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    complement: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    ville: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code_postal: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    pays: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'France'
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    par_defaut: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'addresses',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['par_defaut']
      }
    ]
  });

  return Address;
};

module.exports = { defineAddress }; 