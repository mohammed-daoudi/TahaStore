const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4003;
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Import database configuration and models
const { sequelize, testConnection } = require('../database/config');
const { Coupon, Contact, User } = require('../database/models');

// JWT Secret
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";

app.use(cors());
app.use(express.json());

// Admin authentication middleware
function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
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
        console.log('✅ Admin Service: Successfully connected to MySQL database.');
    } catch (error) {
        console.error('❌ Admin Service: Database connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(initializeDatabase, 5000);
    }
};

// Initial connection attempt
initializeDatabase();

// COUPON MANAGEMENT ENDPOINTS

// Create coupon (admin only)
app.post("/admin/coupons", adminAuth, async (req, res) => {
    try {
        const { code, description, type, value, min_order_amount, max_uses, valid_from, valid_until } = req.body;
        
        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists" });
        }
        
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            type,
            value,
            min_order_amount,
            max_uses,
            valid_from: valid_from || new Date(),
            valid_until,
            created_by: req.user.id
        });
        
        res.status(201).json(coupon);
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get all coupons (admin only)
app.get("/admin/coupons", adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, active } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = {};
        if (active !== undefined) {
            whereClause.active = active === 'true';
        }
        
        const coupons = await Coupon.findAndCountAll({
            where: whereClause,
            include: [{ model: User, as: 'createdBy', attributes: ['nom', 'email'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            coupons: coupons.rows,
            total: coupons.count,
            page: parseInt(page),
            totalPages: Math.ceil(coupons.count / limit)
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update coupon (admin only)
app.put("/admin/coupons/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        
        await coupon.update(updates);
        res.json(coupon);
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete coupon (admin only)
app.delete("/admin/coupons/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        
        await coupon.destroy();
        res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Validate coupon (public endpoint)
app.post("/coupons/validate", async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        
        const coupon = await Coupon.findOne({ 
            where: { 
                code: code.toUpperCase(),
                active: true
            }
        });
        
        if (!coupon) {
            return res.status(404).json({ message: "Invalid coupon code" });
        }
        
        // Check if coupon is expired
        if (coupon.valid_until && new Date() > coupon.valid_until) {
            return res.status(400).json({ message: "Coupon has expired" });
        }
        
        // Check if coupon has reached max uses
        if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
            return res.status(400).json({ message: "Coupon usage limit reached" });
        }
        
        // Check minimum order amount
        if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
            return res.status(400).json({ 
                message: `Minimum order amount required: $${coupon.min_order_amount}` 
            });
        }
        
        // Calculate discount
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = (orderAmount * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }
        
        res.json({
            coupon,
            discountAmount: Math.min(discountAmount, orderAmount) // Don't discount more than order amount
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(400).json({ error: error.message });
    }
});

// CONTACT MANAGEMENT ENDPOINTS

// Submit contact form (public endpoint)
app.post("/contact", async (req, res) => {
    try {
        const { nom, email, sujet, message, telephone } = req.body;
        
        const contact = await Contact.create({
            nom,
            email,
            sujet,
            message,
            telephone,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
        });
        
        res.status(201).json({ 
            message: "Message sent successfully",
            contactId: contact.id
        });
    } catch (error) {
        console.error('Submit contact error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get all contact inquiries (admin only)
app.get("/admin/contacts", adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, statut, priorite } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = {};
        if (statut) whereClause.statut = statut;
        if (priorite) whereClause.priorite = priorite;
        
        const contacts = await Contact.findAndCountAll({
            where: whereClause,
            include: [{ model: User, as: 'respondedBy', attributes: ['nom', 'email'] }],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            contacts: contacts.rows,
            total: contacts.count,
            page: parseInt(page),
            totalPages: Math.ceil(contacts.count / limit)
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Get contact by ID (admin only)
app.get("/admin/contacts/:id", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await Contact.findByPk(id, {
            include: [{ model: User, as: 'respondedBy', attributes: ['nom', 'email'] }]
        });
        
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        
        res.json(contact);
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Respond to contact (admin only)
app.post("/admin/contacts/:id/respond", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { reponse, statut } = req.body;
        
        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        
        await contact.update({
            reponse,
            statut: statut || 'repondu',
            repondu_par: req.user.id,
            date_reponse: new Date()
        });
        
        res.json({ 
            message: "Response sent successfully",
            contact
        });
    } catch (error) {
        console.error('Respond to contact error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update contact status (admin only)
app.patch("/admin/contacts/:id/status", adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { statut, priorite } = req.body;
        
        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        
        const updates = {};
        if (statut) updates.statut = statut;
        if (priorite) updates.priorite = priorite;
        
        await contact.update(updates);
        
        res.json(contact);
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(400).json({ error: error.message });
    }
});

// STATISTICS ENDPOINTS (Optional)

// Get dashboard statistics (admin only)
app.get("/admin/stats", adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalOrders = await require('../database/models').Order.count();
        const totalProducts = await require('../database/models').Product.count();
        const totalContacts = await Contact.count({ where: { statut: 'nouveau' } });
        
        // Get recent orders for revenue calculation
        const recentOrders = await require('../database/models').Order.findAll({
            where: {
                created_at: {
                    [sequelize.Op.gte]: new Date(new Date() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                }
            }
        });
        
        const totalRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
        
        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue: totalRevenue.toFixed(2),
            newContacts: totalContacts,
            recentOrders: recentOrders.length
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Admin Service running on port ${PORT}`);
}); 