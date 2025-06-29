const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const { defineFavorite } = require('../database/models/Favorite');
const { defineProduct } = require('../database/models/Product');
const { defineUser } = require('../database/models/User');

const app = express();
const PORT = 4005;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sequelize = new Sequelize('shopease_db', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

// Initialize models
let Favorite, Product, User;

const initializeModels = async () => {
  try {
    Favorite = await defineFavorite(sequelize);
    Product = await defineProduct(sequelize);
    User = await defineUser(sequelize);

    // Define associations
    Favorite.belongsTo(User, { foreignKey: 'user_id' });
    Favorite.belongsTo(Product, { foreignKey: 'product_id' });
    User.hasMany(Favorite, { foreignKey: 'user_id' });
    Product.hasMany(Favorite, { foreignKey: 'product_id' });

    console.log('Favorites service models initialized');
  } catch (error) {
    console.error('Error initializing models:', error);
  }
};

// Routes
app.post('/favorites', async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: 'User ID and Product ID are required' });
    }

    // Check if favorite already exists
    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Product is already in favorites' });
    }

    // Create new favorite
    const favorite = await Favorite.create({
      user_id: userId,
      product_id: productId
    });

    res.status(201).json({ 
      message: 'Added to favorites successfully',
      favorite: {
        _id: favorite.id,
        userId: favorite.user_id,
        productId: favorite.product_id,
        createdAt: favorite.created_at
      }
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Failed to add to favorites' });
  }
});

app.delete('/favorites/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const deleted = await Favorite.destroy({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites successfully' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ message: 'Failed to remove from favorites' });
  }
});

app.get('/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const favorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          attributes: ['id', 'name', 'price', 'description', 'image_url', 'actif']
        }
      ]
    });

    res.json(favorites.map(fav => ({
      _id: fav.id,
      userId: fav.user_id,
      productId: fav.product_id,
      createdAt: fav.created_at,
      product: fav.Product
    })));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

app.get('/favorites/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    res.json({ isFavorited: !!favorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({ message: 'Failed to check favorite status' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'favorites-service' });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Favorites service database connected');
    
    await initializeModels();
    
    app.listen(PORT, () => {
      console.log(`Favorites service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start favorites service:', error);
  }
};

startServer(); 