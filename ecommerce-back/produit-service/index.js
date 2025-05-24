const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4000;
const mongoose = require("mongoose");
const Produit = require("./Produit");
const cors = require('cors');
const Favoris = require("./Favoris");

app.use(cors());
app.use(express.json());
mongoose.set('strictQuery', true);
//Connection à la base de données MongoDB publication-service-db
//(Mongoose créera la base de données s'il ne le trouve pas)
mongoose.connect(
    "mongodb://localhost/ecommerce",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Produit-Service DB Connected`);
    }
);
//La méthode save() renvoie une Promise.
//Ainsi, dans le bloc then(), nous renverrons une réponse de réussite avec un code 201 de réussite.
//Dans le bloc catch () , nous renverrons une réponse avec l'erreur générée par Mongoose ainsi qu'un code d'erreur 400.

app.post("/produit/ajouter", (req, res, next) => {
    const { nom, description, prix } = req.body;
    const newProduit = new Produit({
        nom,
        description,
        prix
    });
    newProduit.save()
        .then(produit => res.status(201).json(produit))
        .catch(error => res.status(400).json({ error }));
});


app.post("/produit/acheter", (req, res, next) => {
    const { ids } = req.body;
    Produit.find({ _id: { $in: ids } })
        .then(produits => res.status(201).json(produits))
        .catch(error => res.status(400).json({ error }));

});

// Add to favorites
app.post("/favorites", async (req, res) => {
    try {
        const { userId, productId } = req.body;

        // Check if product exists
        const product = await Produit.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Add to favorites
        const favorite = new Favoris({
            userId,
            productId
        });

        await favorite.save();

        res.status(201).json({
            message: "Product added to favorites",
            favorite
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Product already in favorites" });
        }
        console.error('Add to favorites error:', error);
        res.status(500).json({ message: "Error adding to favorites" });
    }
});

// Remove from favorites
app.delete("/favorites/:userId/:productId", async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const result = await Favoris.deleteOne({ userId, productId });

        if (result.deletedCount === 0) {
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

        const favorites = await Favoris.find({ userId })
            .populate('productId')
            .sort({ createdAt: -1 });

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

        const favorite = await Favoris.findOne({ userId, productId });

        res.json({ isFavorited: !!favorite });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ message: "Error checking favorite status" });
    }
});

app.listen(PORT, () => {
    console.log(`Product-Service at ${PORT}`);
});