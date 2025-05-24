require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../auth-service/Utilisateur');
const Produit = require('../produit-service/Produit');
const Commande = require('../commande-service/Commande');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce";

// Sample data
const sampleUsers = [
    {
        nom: "Admin User",
        email: "admin@example.com",
        mot_passe: "admin123",
        role: "admin",
        telephone: "0123456789",
        adresses: [{
            rue: "123 Admin Street",
            ville: "Paris",
            codePostal: "75001",
            pays: "France",
            estParDefaut: true
        }]
    },
    {
        nom: "John Doe",
        email: "john@example.com",
        mot_passe: "password123",
        telephone: "0987654321",
        adresses: [{
            rue: "456 Main Street",
            ville: "Lyon",
            codePostal: "69001",
            pays: "France",
            estParDefaut: true
        }]
    }
];

const sampleProducts = [
    {
        nom: "Smartphone XYZ",
        description: "Latest smartphone with amazing features",
        descriptionCourte: "High-end smartphone",
        prix: 799.99,
        categorie: "Electronics",
        sousCategories: ["Smartphones", "Mobile Devices"],
        marque: "TechBrand",
        images: [
            "https://example.com/phone1.jpg",
            "https://example.com/phone2.jpg"
        ],
        stock: 50,
        sku: "PHN-001",
        tags: ["smartphone", "mobile", "tech"],
        caracteristiques: {
            "Screen": "6.5 inch OLED",
            "RAM": "8GB",
            "Storage": "128GB"
        }
    },
    {
        nom: "Laptop Pro",
        description: "Professional laptop for work and gaming",
        descriptionCourte: "High-performance laptop",
        prix: 1299.99,
        categorie: "Electronics",
        sousCategories: ["Laptops", "Computers"],
        marque: "TechBrand",
        images: [
            "https://example.com/laptop1.jpg",
            "https://example.com/laptop2.jpg"
        ],
        stock: 30,
        sku: "LPT-001",
        tags: ["laptop", "computer", "tech"],
        caracteristiques: {
            "Processor": "Intel i7",
            "RAM": "16GB",
            "Storage": "512GB SSD"
        }
    }
];

const seedDatabase = async () => {
    try {
        // Connect to MongoDB with retry logic
        let retries = 5;
        while (retries > 0) {
            try {
                await mongoose.connect(MONGODB_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    serverSelectionTimeoutMS: 5000
                });
                console.log('Connected to MongoDB');
                break;
            } catch (error) {
                retries--;
                if (retries === 0) {
                    throw new Error('Failed to connect to MongoDB after multiple attempts');
                }
                console.log(`Failed to connect to MongoDB. Retrying... (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            Utilisateur.deleteMany({}),
            Produit.deleteMany({}),
            Commande.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Hash passwords and create users
        console.log('Creating users...');
        const hashedUsers = await Promise.all(
            sampleUsers.map(async (user) => ({
                ...user,
                mot_passe: await bcrypt.hash(user.mot_passe, 10)
            }))
        );
        const createdUsers = await Utilisateur.insertMany(hashedUsers);
        console.log('Created users');

        // Create products
        console.log('Creating products...');
        const createdProducts = await Produit.insertMany(sampleProducts);
        console.log('Created products');

        // Create sample orders
        console.log('Creating orders...');
        const sampleOrders = createdUsers.map(user => ({
            utilisateurId: user._id,
            numero: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            produits: createdProducts.map(product => ({
                produitId: product._id,
                nom: product.nom,
                prix: product.prix,
                quantite: Math.floor(Math.random() * 3) + 1,
                sku: product.sku
            })),
            statut: 'confirmee',
            sousTotal: createdProducts.reduce((sum, product) => sum + product.prix, 0),
            fraisLivraison: 9.99,
            taxe: 20.00,
            total: createdProducts.reduce((sum, product) => sum + product.prix, 0) + 29.99,
            paiement: {
                methode: 'carte',
                statut: 'complete',
                montant: createdProducts.reduce((sum, product) => sum + product.prix, 0) + 29.99,
                date: new Date(),
                reference: `PAY-${Date.now()}`
            },
            livraison: {
                methode: 'standard',
                cout: 9.99,
                adresse: user.adresses[0],
                statut: 'livree',
                numeroSuivi: `TRK-${Date.now()}`,
                dateExpedition: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                dateLivraison: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            }
        }));

        await Commande.insertMany(sampleOrders);
        console.log('Created orders');

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

seedDatabase(); 