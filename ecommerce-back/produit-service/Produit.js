const mongoose = require("mongoose");

const AvisSchema = new mongoose.Schema({
    utilisateurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utilisateur'
    },
    note: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    commentaire: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const VarianteSchema = new mongoose.Schema({
    nom: String,
    sku: String,
    prix: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    attributs: {
        couleur: String,
        taille: String,
        poids: Number,
        dimensions: {
            longueur: Number,
            largeur: Number,
            hauteur: Number
        }
    }
});

const ProduitSchema = mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    descriptionCourte: String,
    prix: {
        type: Number,
        required: true
    },
    prixPromo: Number,
    categorie: {
        type: String,
        required: true
    },
    sousCategories: [String],
    marque: String,
    images: [String],
    variantes: [VarianteSchema],
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    sku: {
        type: String,
        unique: true
    },
    tags: [String],
    caracteristiques: {
        type: Map,
        of: String
    },
    avis: [AvisSchema],
    noteMoyenne: {
        type: Number,
        default: 0
    },
    nombreAvis: {
        type: Number,
        default: 0
    },
    estActif: {
        type: Boolean,
        default: true
    },
    estEnPromo: {
        type: Boolean,
        default: false
    },
    datePromoDebut: Date,
    datePromoFin: Date,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Create indexes
ProduitSchema.index({ nom: 'text', description: 'text' });
ProduitSchema.index({ categorie: 1 });
ProduitSchema.index({ marque: 1 });
ProduitSchema.index({ sku: 1 }, { unique: true });

// Update the updated_at timestamp before saving
ProduitSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model("produit", ProduitSchema);
