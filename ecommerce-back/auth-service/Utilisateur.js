const mongoose = require("mongoose");

const AdresseSchema = new mongoose.Schema({
    rue: String,
    ville: String,
    codePostal: String,
    pays: String,
    estParDefaut: Boolean
});

const UtilisateurSchema = mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    mot_passe: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    telephone: String,
    adresses: [AdresseSchema],
    role: {
        type: String,
        enum: ['client', 'admin'],
        default: 'client'
    },
    dateNaissance: Date,
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        langue: {
            type: String,
            default: 'fr'
        }
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Create indexes
UtilisateurSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("utilisateur", UtilisateurSchema);