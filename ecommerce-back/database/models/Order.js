const { DataTypes } = require('sequelize');

let Order = null;

const defineOrder = async (sequelize) => {
  if (Order) {
    return Order;
  }

  Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    numero_commande: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'),
      allowNull: false,
      defaultValue: 'en_attente'
    },
    sous_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    frais_livraison: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    reduction: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    methode_paiement: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    statut_paiement: {
      type: DataTypes.ENUM('en_attente', 'paye', 'echoue', 'rembourse'),
      allowNull: false,
      defaultValue: 'en_attente'
    },
    adresse_facturation: {
      type: DataTypes.JSON,
      allowNull: false
    },
    adresse_livraison: {
      type: DataTypes.JSON,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_livraison_estimee: {
      type: DataTypes.DATE,
      allowNull: true
    },
    numero_suivi: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    transporteur: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    coupon_code: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    reduction_coupon: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    }
  }, {
    tableName: 'orders',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['statut']
      },
      {
        fields: ['numero_commande']
      },
      {
        fields: ['date_livraison_estimee']
      }
    ]
  });

  return Order;
};

module.exports = { defineOrder }; 