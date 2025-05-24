const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4002;
const mongoose = require("mongoose");
const Utilisateur = require("./Utilisateur");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const cors = require('cors');

// MongoDB connection configuration
const MONGODB_URI = "mongodb://localhost:27017/ecommerce";
const JWT_SECRET = "your-super-secret-jwt-key-change-this-in-production";

// Enable CORS
app.use(cors());
app.use(express.json());

// Test route to verify database connection
app.get("/test-db", async (req, res) => {
    try {
        // Try to connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // Check if we can perform a simple operation
        const userCount = await Utilisateur.countDocuments();
        
        res.json({
            message: "Database connection successful",
            userCount: userCount,
            database: mongoose.connection.db.databaseName
        });
    } catch (error) {
        res.status(500).json({
            message: "Database connection failed",
            error: error.message
        });
    }
});

// MongoDB connection with retry logic
const connectWithRetry = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Successfully connected to MongoDB.');
        
        // Create indexes after connection
        await Utilisateur.createIndexes();
        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

// Initial connection attempt
connectWithRetry();

// Connection event handlers
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    connectWithRetry();
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// Middleware
app.use(cors());
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Register endpoint
app.post("/auth/register", async (req, res) => {
    try {
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

        // Check if user exists
        const userExists = await Utilisateur.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(mot_passe, 10);

        // Create new user
        const newUser = new Utilisateur({
            nom,
            email,
            mot_passe: hashedPassword
        });

        // Save user
        const savedUser = await newUser.save();
        
        // Generate token
        const token = jwt.sign(
            { id: savedUser._id, email: savedUser.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: savedUser._id,
                nom: savedUser.nom,
                email: savedUser.email
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
        const { email, mot_passe } = req.body;

        // Input validation
        if (!email || !mot_passe) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user
        const user = await Utilisateur.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(mot_passe, user.mot_passe);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Error during login" });
    }
});

// Forgot password endpoint
app.post("/auth/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await Utilisateur.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Email not found" });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // In a real application, you would:
        // 1. Save the reset token to the user document
        // 2. Send an email with the reset link
        // For now, we'll just return the token
        res.json({
            message: "Password reset instructions sent",
            resetToken
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: "Error processing request" });
    }
});

// Reset password endpoint
app.post("/auth/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await Utilisateur.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.mot_passe = hashedPassword;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: "Error resetting password" });
    }
});

// Get user profile endpoint
app.get("/auth/profile", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await Utilisateur.findById(decoded.id).select('-mot_passe');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

app.listen(PORT, () => {
    console.log(`Auth-Service running on port ${PORT}`);
});
