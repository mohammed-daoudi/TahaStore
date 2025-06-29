const express = require("express");
const app = express();
const PORT = process.env.PORT_THREE || 4001;
const axios = require('axios');
const isAuthenticated = require('./isAuthenticated');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import database configuration and models
const { getSequelize, testConnection } = require('../database/config');
const { initializeModels } = require('../database/models');

app.use(cors());
app.use(express.json());

// Initialize database connection and models
let models = null;
let sequelize = null;
const initializeDatabase = async () => {
    try {
        sequelize = await getSequelize();
        await testConnection();
        models = await initializeModels(sequelize);
        console.log('✅ Order Service: Successfully connected to MySQL database.');
    } catch (error) {
        console.error('❌ Order Service: Database connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(initializeDatabase, 5000);
    }
};

// Initial connection attempt
initializeDatabase();

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'shopease_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = user;
        next();
    });
};

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET || 'shopease_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
        req.user = user;
        next();
    });
};

// Calculate total price of an order
function prixTotal(produits) {
    let total = 0;
    for (let t = 0; t < produits.length; ++t) {
        total += parseFloat(produits[t].prix);
    }
    return total;
}

// HTTP request to product service to get products by IDs
async function httpRequest(ids) {
    try {
        const URL = "http://localhost:4000/produit/acheter";
        const response = await axios.post(URL, { ids: ids }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return prixTotal(response.data);
    } catch (error) {
        console.error('HTTP request error:', error);
        throw error;
    }
}

// Generate order number
function generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
}

// Real-time inventory update function
async function updateInventory(productIds, quantities) {
    try {
        for (let i = 0; i < productIds.length; i++) {
            const product = await models.Product.findByPk(productIds[i]);
            if (product) {
                const newStock = Math.max(0, product.stock - quantities[i]);
                await product.update({ stock: newStock });
            }
        }
    } catch (error) {
        console.error('Inventory update error:', error);
        throw error;
    }
}

// Create order endpoint
app.post("/commande/ajouter", authenticateToken, async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { Order, OrderItem, Product } = models;
        const { productIds, quantities, shippingAddress, paymentMethod, shippingMethod } = req.body;
        
        // Get products from product service
        const products = await Product.findAll({
            where: { id: productIds }
        });
        
        if (products.length === 0) {
            return res.status(400).json({ message: "No valid products found" });
        }
        
        // Check stock availability
        for (let i = 0; i < products.length; i++) {
            if (products[i].stock < quantities[i]) {
                return res.status(400).json({ 
                    message: `Insufficient stock for ${products[i].nom}. Available: ${products[i].stock}` 
                });
            }
        }
        
        // Calculate totals
        const subtotal = products.reduce((sum, product, index) => {
            return sum + (parseFloat(product.prix) * (quantities[index] || 1));
        }, 0);
        
        const shippingCost = shippingMethod === 'express' ? 15.00 : 5.00;
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shippingCost + tax;
        
        // Create order
        const order = await Order.create({
            numero_commande: generateOrderNumber(),
            user_id: req.user.userId,
            statut: 'en_attente',
            sous_total: subtotal,
            frais_livraison: shippingCost,
            reduction: 0,
            total: total,
            methode_paiement: paymentMethod || 'carte',
            statut_paiement: 'en_attente',
            adresse_facturation: shippingAddress,
            adresse_livraison: shippingAddress
        });
        
        // Create order items
        const orderItems = products.map((product, index) => ({
            order_id: order.id,
            product_id: product.id,
            nom: product.nom,
            prix_unitaire: product.prix,
            prix_total: product.prix * (quantities[index] || 1),
            quantite: quantities[index] || 1,
            reduction: 0,
            sku: product.sku
        }));
        
        await OrderItem.bulkCreate(orderItems);
        
        // Update inventory in real-time
        await updateInventory(productIds, quantities);
        
        // Get complete order with items
        const completeOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: models.User, as: 'user', attributes: ['nom', 'email'] }
            ]
        });
        
        res.status(201).json(completeOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: "Error creating order" });
    }
});

// Get user orders
app.get("/commande/utilisateur/:userId", authenticateToken, async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { Order, OrderItem, Product } = models;
        const { userId } = req.params;

        // Verify user can only access their own orders
        if (req.user.userId != userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }
        
        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        res.json(orders);
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// Get order by ID
app.get("/commande/:id", authenticateToken, async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { Order, OrderItem, Product, User } = models;
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['nom', 'email']
                }
            ]
        });
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Verify user can only access their own orders
        if (req.user.userId != order.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: "Error fetching order" });
    }
});

// Admin: Get all orders
app.get("/admin/commandes", adminAuth, async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { Order, OrderItem, Product, User } = models;

        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['nom', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json(orders);
    } catch (error) {
        console.error('Admin get orders error:', error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// Admin: Get all orders (with pagination)
app.get("/admin/commande/liste", adminAuth, async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { Order, OrderItem, Product, User } = models;
        const { page = 1, limit = 10, status } = req.query;

        let whereClause = {};
        if (status) {
            whereClause.statut = status;
        }

        const orders = await Order.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['nom', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        });

        res.json({
            orders: orders.rows,
            total: orders.count,
            pages: Math.ceil(orders.count / parseInt(limit)),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Admin get orders error:', error);
        res.status(500).json({ message: "Error fetching orders" });
    }
});

// Admin: Get order statistics
app.get("/admin/commande/statistiques", adminAuth, async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { Order } = models;

        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { statut: 'en_attente' } });
        const completedOrders = await Order.count({ where: { statut: 'livree' } });
        const cancelledOrders = await Order.count({ where: { statut: 'annulee' } });

        const totalRevenue = await Order.sum('total', { where: { statut: 'livree' } });

        res.json({
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: totalRevenue || 0
        });
    } catch (error) {
        console.error('Get order statistics error:', error);
        res.status(500).json({ message: "Error fetching statistics" });
    }
});

// Admin: Update order status
app.patch("/admin/commandes/:id/status", adminAuth, async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { Order } = models;
        const { id } = req.params;
        const { statut } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await order.update({ statut });
        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: "Error updating order status" });
    }
});

app.listen(PORT, () => {
    console.log(`Commande-Service at ${PORT}`);
});
