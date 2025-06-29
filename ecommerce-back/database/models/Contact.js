const { DataTypes } = require('sequelize');

let Contact = null;

const defineContact = async (sequelize) => {
  if (Contact) {
    return Contact;
  }

  Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    sujet: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    statut: {
      type: DataTypes.ENUM('nouveau', 'en_cours', 'repondu', 'ferme'),
      allowNull: false,
      defaultValue: 'nouveau'
    },
    priorite: {
      type: DataTypes.ENUM('basse', 'normale', 'haute', 'urgente'),
      allowNull: false,
      defaultValue: 'normale'
    },
    reponse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    repondu_par: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    date_reponse: {
      type: DataTypes.DATE,
      allowNull: true
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'contacts',
    indexes: [
      {
        fields: ['statut']
      },
      {
        fields: ['priorite']
      },
      {
        fields: ['email']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Contact;
};

module.exports = { defineContact }; 