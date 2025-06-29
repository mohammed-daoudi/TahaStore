const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4001;
const axios = require('axios');
const isAuthenticated = require('./isAuthenticated');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import database configuration and models
const { sequelize, testConnection } = require('../database/config');
const { Order, OrderItem, Product, User } = require('../database/models');

app.use(cors());
app.use(express.json());

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

// Initialize database connection
const initializeDatabase = async () => {
    try {
        await testConnection();
        console.log('✅ Order Service: Successfully connected to MySQL database.');
    } catch (error) {
        console.error('❌ Order Service: Database connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(initializeDatabase, 5000);
    }
};

// Initial connection attempt
initializeDatabase();

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
            const product = await Product.findByPk(productIds[i]);
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
app.post("/commande/ajouter", isAuthenticated, async (req, res, next) => {
    try {
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
            user_id: req.user.id,
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
                { model: User, as: 'user', attributes: ['nom', 'email'] }
            ]
        });
        
        res.status(201).json(completeOrder);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get user orders
app.get("/commande/utilisateur/:userId", isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.params;
        
        // Verify user can only access their own orders
        if (req.user.id != userId && req.user.role !== 'admin') {
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
        res.status(400).json({ error: error.message });
    }
});

// Get order by ID
app.get("/commande/:orderId", isAuthenticated, async (req, res, next) => {
    try {
        const { orderId } = req.params;
        
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product' }]
                },
                { model: User, as: 'user', attributes: ['nom', 'email'] }
            ]
        });
        
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        // Verify user can only access their own orders
        if (order.user_id != req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied" });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Get order error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Admin: Get all orders
app.get("/admin/commande/liste", adminAuth, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
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
                { model: User, as: 'user', attributes: ['nom', 'email'] }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            orders: orders.rows,
            total: orders.count,
            page: parseInt(page),
            totalPages: Math.ceil(orders.count / limit)
        });
    } catch (error) {
        console.error('Admin get orders error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Admin: Update order status
app.patch("/admin/commande/:orderId/status", adminAuth, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { statut, numero_suivi, transporteur, notes } = req.body;
        
        const order = await Order.findByPk(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        const updates = {};
        if (statut) updates.statut = statut;
        if (numero_suivi) updates.numero_suivi = numero_suivi;
        if (transporteur) updates.transporteur = transporteur;
        if (notes) updates.notes = notes;
        
        await order.update(updates);
        
        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(400).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Commande-Service at ${PORT}`);
});
