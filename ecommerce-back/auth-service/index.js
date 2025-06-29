const express = require("express");
const app = express();
const PORT = process.env.PORT_TWO || 4002;
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

// Import database configuration and models
const { getSequelize, testConnection } = require('../database/config');
const { initializeModels } = require('../database/models');

// JWT Secret
const JWT_SECRET = "shopease_secret";

// Enable CORS
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Error handling middleware for JSON parsing errors
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        console.error('JSON parsing error:', error);
        return res.status(400).json({ message: 'Invalid JSON format' });
    }
    next();
});

// Initialize database connection and models
let models = null;
let sequelize = null;
const initializeDatabase = async () => {
    try {
        sequelize = await getSequelize();
        await testConnection();
        models = await initializeModels(sequelize);
        console.log('✅ Auth Service: Successfully connected to MySQL database.');
    } catch (error) {
        console.error('❌ Auth Service: Database connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(initializeDatabase, 5000);
    }
};

// Initial connection attempt
initializeDatabase();

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

// Test route to verify database connection
app.get("/test-db", async (req, res) => {
    try {
        await testConnection();
        const userCount = await models.User.count();
        
        res.json({
            message: "Database connection successful",
            userCount: userCount,
            database: "shopease_db"
        });
    } catch (error) {
        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

// Admin: Get all users
app.get("/admin/users", adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const offset = (page - 1) * limit;
        
        let whereClause = {};
        if (search) {
            whereClause = {
                [Op.or]: [
                    { nom: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }
        
        const users = await models.User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['mot_passe'] },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            users: users.rows,
            total: users.count,
            page: parseInt(page),
            totalPages: Math.ceil(users.count / limit)
        });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ message: "Error fetching users" });
    }
});

// Admin: Block/Unblock user
app.patch("/admin/users/:userId/block", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { blocked } = req.body;
        
        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Prevent admin from blocking themselves
        if (user.id === req.user.id) {
            return res.status(400).json({ message: "Cannot block yourself" });
        }
        
        await user.update({ blocked: blocked });
        
        res.json({ 
            message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                blocked: user.blocked
            }
        });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ message: "Error updating user" });
    }
});

// Admin: Reset user password
app.post("/admin/users/:userId/reset-password", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;
        
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        
        const user = await models.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ mot_passe: hashedPassword });
        
        res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Error resetting password" });
    }
});

// Admin: Get user details
app.get("/admin/users/:userId", adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await models.User.findByPk(userId, {
            attributes: { exclude: ['mot_passe'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: "Error fetching user details" });
    }
});

// Register endpoint
app.post("/auth/register", async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { User } = models;
        const { nom, email, mot_passe } = req.body;

        // Input validation
        if (!nom || !email || !mot_passe) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(mot_passe, 10);

        // Create user
        const user = await User.create({
            nom,
            email,
            mot_passe: hashedPassword,
            role: 'user' // Default role
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: "Error registering user" });
    }
});

// Login endpoint
app.post("/auth/login", async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { User } = models;
        const { email, mot_passe } = req.body;

        // Input validation
        if (!email || !mot_passe) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(mot_passe, user.mot_passe);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error during login" });
    }
});

// Get user profile
app.get("/auth/profile", async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { User } = models;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['mot_passe'] }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(401).json({ message: "Invalid token" });
    }
});

// Forgot password endpoint
app.post("/auth/forgot-password", async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { User } = models;
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // In a real application, you would send an email with a reset link
        // For now, we'll just return a success message
        res.json({ message: "Password reset instructions sent to your email" });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Error processing request" });
    }
});

// Reset password endpoint
app.post("/auth/reset-password", async (req, res) => {
    try {
        if (!models) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        const { User } = models;
        const { token, newPassword } = req.body;

        // In a real application, you would verify the reset token
        // For now, we'll just return a success message
        res.json({ message: "Password reset successfully" });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Error resetting password" });
    }
});

app.listen(PORT, () => {
    console.log(`Auth-Service running on port ${PORT}`);
});
