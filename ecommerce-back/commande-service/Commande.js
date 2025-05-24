const mongoose = require("mongoose");

const AdresseSchema = new mongoose.Schema({
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
});

const ProduitCommandeSchema = new mongoose.Schema({
    produitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'produit',
        required: true
    },
    nom: String,
    prix: Number,
    quantite: Number,
    varianteId: String,
    sku: String
});

const PaiementSchema = new mongoose.Schema({
    methode: {
        type: String,
        enum: ['carte', 'paypal', 'virement'],
        required: true
    },
    statut: {
        type: String,
        enum: ['en_attente', 'complete', 'echoue', 'rembourse'],
        default: 'en_attente'
    },
    montant: Number,
    date: Date,
    reference: String,
    details: {
        type: Map,
        of: String
    }
});

const LivraisonSchema = new mongoose.Schema({
    methode: {
        type: String,
        enum: ['standard', 'express', 'point_relais'],
        required: true
    },
    cout: Number,
    adresse: AdresseSchema,
    statut: {
        type: String,
        enum: ['en_preparation', 'expediee', 'en_transit', 'livree', 'retournee'],
        default: 'en_preparation'
    },
    numeroSuivi: String,
    dateExpedition: Date,
    dateLivraisonEstimee: Date,
    dateLivraison: Date
});

const CommandeSchema = mongoose.Schema({
    utilisateurId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utilisateur',
        required: true
    },
    numero: {
        type: String,
        unique: true,
        required: true
    },
    produits: [ProduitCommandeSchema],
    statut: {
        type: String,
        enum: ['en_attente', 'confirmee', 'en_preparation', 'expediee', 'livree', 'annulee', 'remboursee'],
        default: 'en_attente'
    },
    sousTotal: {
        type: Number,
        required: true
    },
    fraisLivraison: {
        type: Number,
        required: true
    },
    taxe: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    paiement: PaiementSchema,
    livraison: LivraisonSchema,
    notes: String,
    dateCommande: {
        type: Date,
        default: Date.now
    },
    dateMiseAJour: {
        type: Date,
        default: Date.now
    }
});

// Create indexes
CommandeSchema.index({ utilisateurId: 1 });
CommandeSchema.index({ numero: 1 }, { unique: true });
CommandeSchema.index({ 'paiement.statut': 1 });
CommandeSchema.index({ 'livraison.statut': 1 });
CommandeSchema.index({ dateCommande: -1 });

// Update the dateMiseAJour timestamp before saving
CommandeSchema.pre('save', function(next) {
    this.dateMiseAJour = Date.now();
    next();
});

module.exports = mongoose.model("commande", CommandeSchema);