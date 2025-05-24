const mongoose = require("mongoose");

const FavorisSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure a user can't favorite the same product twice
FavorisSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Favoris", FavorisSchema); 