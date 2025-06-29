const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

let User = null;

const defineUser = async (sequelize) => {
  if (User) {
    return User;
  }

  User = sequelize.define('User', {
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
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    mot_passe: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('client', 'admin'),
      defaultValue: 'client'
    },
    blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    date_naissance: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preferences_newsletter: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    preferences_langue: {
      type: DataTypes.STRING(10),
      defaultValue: 'fr'
    }
  }, {
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.mot_passe) {
          user.mot_passe = await bcrypt.hash(user.mot_passe, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('mot_passe')) {
          user.mot_passe = await bcrypt.hash(user.mot_passe, 10);
        }
      }
    }
  });

  // Instance method to compare password
  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.mot_passe);
  };

  return User;
};

module.exports = { defineUser }; 