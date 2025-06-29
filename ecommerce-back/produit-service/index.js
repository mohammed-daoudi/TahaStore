const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4000;
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

// Import database configuration and models
const { sequelize, testConnection } = require('../database/config');
const { Product, Favorite, Review, User } = require('../database/models');

app.use(cors());
app.use(express.json());

// Initialize database connection
const initializeDatabase = async () => {
    try {
        await testConnection();
        console.log('✅ Product Service: Successfully connected to MySQL database.');
    } catch (error) {
        console.error('❌ Product Service: Database connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(initializeDatabase, 5000);
    }
};

// Initial connection attempt
initializeDatabase();

// Multer setup for local disk image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/products'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Admin authentication middleware
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'shopease_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    req.user = user;
    next();
  });
}

// Image upload endpoint (admin only)
app.post('/admin/upload-image', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the relative URL to the uploaded image
  const imageUrl = `/uploads/products/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

// Secure add product endpoint (admin only)
app.post("/produit/ajouter", adminAuth, async (req, res, next) => {
    try {
        const { nom, description, prix, categorie, marque, stock, images } = req.body;
        const newProduct = await Product.create({
            nom,
            description,
            prix,
            categorie,
            marque,
            stock: stock || 0,
            images: images ? JSON.stringify(images) : null
        });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Add product error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Edit product (admin only)
app.put("/admin/produit/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        await product.update(updates);
        res.json(product);
    } catch (error) {
        console.error('Edit product error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete product (admin only)
app.delete("/admin/produit/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        await product.destroy();
        res.json({ message: "Product deleted" });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update price, stock, category (admin only)
app.patch("/admin/produit/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { prix, stock, categorie } = req.body;
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        if (prix !== undefined) product.prix = prix;
        if (stock !== undefined) product.stock = stock;
        if (categorie !== undefined) product.categorie = categorie;
        await product.save();
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Admin: List all products (including inactive)
app.get("/admin/produit/liste", adminAuth, async (req, res) => {
    try {
        const products = await Product.findAll({
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Review,
                    as: 'reviews',
                    include: [{ model: User, as: 'user', attributes: ['nom'] }]
                }
            ]
        });
        res.json(products);
    } catch (error) {
        console.error('Admin get products error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get products endpoint
app.get("/produit/liste", async (req, res, next) => {
    try {
        const { category, search, minPrice, maxPrice, sort } = req.query;
        
        let whereClause = { est_actif: true };
        
        if (category) {
            whereClause.categorie = category;
        }
        
        if (search) {
            whereClause.nom = { [sequelize.Op.like]: `%${search}%` };
        }
        
        if (minPrice) {
            whereClause.prix = { [sequelize.Op.gte]: parseFloat(minPrice) };
        }
        
        if (maxPrice) {
            whereClause.prix = { ...whereClause.prix, [sequelize.Op.lte]: parseFloat(maxPrice) };
        }
        
        let orderClause = [['created_at', 'DESC']];
        
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    orderClause = [['prix', 'ASC']];
                    break;
                case 'price_desc':
                    orderClause = [['prix', 'DESC']];
                    break;
                case 'popular':
                    orderClause = [['note_moyenne', 'DESC']];
                    break;
            }
        }
        
        const products = await Product.findAll({
            where: whereClause,
            order: orderClause,
            include: [
                {
                    model: Review,
                    as: 'reviews',
                    include: [{ model: User, as: 'user', attributes: ['nom'] }]
                }
            ]
        });
        
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get product by ID endpoint
app.get("/produit/:id", async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: Review,
                    as: 'reviews',
                    include: [{ model: User, as: 'user', attributes: ['nom'] }]
                }
            ]
        });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Buy products endpoint (get products by IDs)
app.post("/produit/acheter", async (req, res, next) => {
    try {
        const { ids } = req.body;
        
        const products = await Product.findAll({
            where: { id: ids }
        });
        
        res.status(200).json(products);
    } catch (error) {
        console.error('Buy products error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Add to favorites
app.post("/favorites", async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            where: { user_id: userId, product_id: productId }
        });

        if (existingFavorite) {
            return res.status(400).json({ message: "Product already in favorites" });
        }

        // Add to favorites
        const favorite = await Favorite.create({
            user_id: userId,
            product_id: productId
        });

        res.status(201).json({
            message: "Product added to favorites",
            favorite
        });
    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ message: "Error adding to favorites" });
    }
});

// Remove from favorites
app.delete("/favorites/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const result = await Favorite.destroy({
            where: { user_id: userId, product_id: productId }
        });

        if (result === 0) {
            return res.status(404).json({ message: "Favorite not found" });
        }

        res.json({ message: "Product removed from favorites" });
    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({ message: "Error removing from favorites" });
    }
});

// Get user favorites
app.get("/favorites/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const favorites = await Favorite.findAll({
            where: { user_id: userId },
            include: [{ model: Product, as: 'product' }],
            order: [['created_at', 'DESC']]
        });

        res.json(favorites);
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ message: "Error fetching favorites" });
    }
});

// Check if product is favorited
app.get("/favorites/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const favorite = await Favorite.findOne({
            where: { user_id: userId, product_id: productId }
        });

        res.json({ isFavorited: !!favorite });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ message: "Error checking favorite status" });
    }
});

// Add review
app.post("/produit/:id/reviews", async (req, res) => {
    try {
        const { userId, note, commentaire } = req.body;
        const productId = req.params.id;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            where: { user_id: userId, product_id: productId }
        });

        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        // Create review
        const review = await Review.create({
            user_id: userId,
            product_id: productId,
            note,
            commentaire
        });

        // Update product rating
        const reviews = await Review.findAll({ where: { product_id: productId } });
        const avgRating = reviews.reduce((sum, r) => sum + r.note, 0) / reviews.length;
        
        await product.update({
            note_moyenne: avgRating,
            nombre_avis: reviews.length
        });

        res.status(201).json({
            message: "Review added successfully",
            review
        });
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: "Error adding review" });
    }
});

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});