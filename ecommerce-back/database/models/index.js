const { defineUser } = require('./User');
const { defineProduct } = require('./Product');
const { defineOrder } = require('./Order');
const { defineOrderItem } = require('./OrderItem');
const { defineFavorite } = require('./Favorite');
const { defineReview } = require('./Review');
const { defineAddress } = require('./Address');
const { defineCoupon } = require('./Coupon');
const { defineContact } = require('./Contact');

let models = null;

const initializeModels = async (sequelize) => {
  if (models) {
    return models;
  }

  // Define all models
  const User = await defineUser(sequelize);
  const Product = await defineProduct(sequelize);
  const Order = await defineOrder(sequelize);
  const OrderItem = await defineOrderItem(sequelize);
  const Favorite = await defineFavorite(sequelize);
  const Review = await defineReview(sequelize);
  const Address = await defineAddress(sequelize);
  const Coupon = await defineCoupon(sequelize);
  const Contact = await defineContact(sequelize);

  // Define associations
  // User associations
  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  User.hasMany(Favorite, { foreignKey: 'user_id', as: 'favorites' });
  User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
  User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
  User.hasMany(Coupon, { foreignKey: 'created_by', as: 'createdCoupons' });
  User.hasMany(Contact, { foreignKey: 'repondu_par', as: 'respondedContacts' });

  // Product associations
  Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
  Product.hasMany(Favorite, { foreignKey: 'product_id', as: 'favorites' });
  Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

  // Order associations
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

  // OrderItem associations
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Favorite associations
  Favorite.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Favorite.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Review associations
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Address associations
  Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Coupon associations
  Coupon.belongsTo(User, { foreignKey: 'created_by', as: 'createdBy' });

  // Contact associations
  Contact.belongsTo(User, { foreignKey: 'repondu_par', as: 'respondedBy' });

  models = {
    User,
    Product,
    Order,
    OrderItem,
    Favorite,
    Review,
    Address,
    Coupon,
    Contact
  };

  return models;
};

module.exports = { initializeModels }; 