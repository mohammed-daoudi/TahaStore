const { DataTypes } = require('sequelize');

let Product = null;

const defineProduct = async (sequelize) => {
  if (Product) {
    return Product;
  }

  Product = sequelize.define('Product', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nom: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    prix: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    prix_reduit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    categorie: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sous_categorie: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    marque: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    poids: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Weight in grams'
    },
    dimensions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Length, width, height in cm'
    },
    couleurs: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    tailles: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    note_moyenne: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    },
    nombre_avis: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    actif: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    en_vedette: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    sku: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    meta_titre: {
      type: DataTypes.STRING(60),
      allowNull: true
    },
    meta_description: {
      type: DataTypes.STRING(160),
      allowNull: true
    }
  }, {
    tableName: 'products',
    indexes: [
      {
        fields: ['categorie']
      },
      {
        fields: ['marque']
      },
      {
        fields: ['actif']
      },
      {
        fields: ['en_vedette']
      }
    ]
  });

  return Product;
};

module.exports = { defineProduct }; 