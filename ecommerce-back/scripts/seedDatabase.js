const { getSequelize } = require('../database/config');
const { initializeModels } = require('../database/models');

const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database with sample data...');
    
    // Get database connection and models
    const sequelize = await getSequelize();
    const models = await initializeModels(sequelize);
    
    // Create sample users
    console.log('Creating sample users...');
    const users = await models.User.bulkCreate([
      {
        nom: 'John Doe',
        email: 'john@example.com',
        mot_passe: 'password123',
        telephone: '+1234567890',
        role: 'client'
      },
      {
        nom: 'Jane Smith',
        email: 'jane@example.com',
        mot_passe: 'password123',
        telephone: '+1234567891',
        role: 'admin'
      },
      {
        nom: 'Admin User',
        email: 'admin@shopease.com',
        mot_passe: 'admin123',
        telephone: '+1234567892',
        role: 'admin'
      }
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create sample products
    console.log('Creating sample products...');
    const products = await models.Product.bulkCreate([
      {
        nom: 'Wireless Headphones',
        description: 'Experience premium sound quality with our wireless headphones. Featuring active noise cancellation, comfortable over-ear design, and long battery life.',
        prix: 99.99,
        prix_reduit: 79.99,
        categorie: 'Electronics',
        sous_categorie: 'Audio',
        marque: 'AudioTech',
        images: [
          'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/164710/pexels-photo-164710.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ],
        stock: 15,
        poids: 250,
        dimensions: { longueur: 20, largeur: 15, hauteur: 8 },
        couleurs: ['Black', 'White', 'Blue'],
        tailles: ['One Size'],
        tags: ['wireless', 'noise-cancellation', 'bluetooth'],
        note_moyenne: 4.7,
        nombre_avis: 124,
        actif: true,
        en_vedette: true,
        sku: 'WH-001',
        meta_titre: 'Wireless Headphones - Premium Sound Quality',
        meta_description: 'Experience premium sound quality with our wireless headphones featuring active noise cancellation and long battery life.'
      },
      {
        nom: 'Smart Watch',
        description: 'Track your fitness and stay connected with this smartwatch. Features activity tracking, heart rate monitoring, and smartphone notifications.',
        prix: 159.99,
        prix_reduit: 129.99,
        categorie: 'Electronics',
        sous_categorie: 'Wearables',
        marque: 'FitTech',
        images: [
          'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ],
        stock: 10,
        poids: 45,
        dimensions: { longueur: 4, largeur: 4, hauteur: 1 },
        couleurs: ['Silver', 'Black', 'Rose Gold'],
        tailles: ['42mm', '46mm'],
        tags: ['smartwatch', 'fitness', 'health'],
        note_moyenne: 4.5,
        nombre_avis: 89,
        actif: true,
        en_vedette: true,
        sku: 'SW-001',
        meta_titre: 'Smart Watch - Fitness Tracking & Connectivity',
        meta_description: 'Track your fitness and stay connected with this smartwatch featuring activity tracking and heart rate monitoring.'
      },
      {
        nom: 'Desk Lamp',
        description: 'Adjustable desk lamp with multiple brightness levels. Perfect for your home office or study area.',
        prix: 49.99,
        categorie: 'Home',
        sous_categorie: 'Lighting',
        marque: 'LuxLight',
        images: [
          'https://images.pexels.com/photos/4050304/pexels-photo-4050304.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/7000506/pexels-photo-7000506.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/943257/pexels-photo-943257.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ],
        stock: 25,
        poids: 1200,
        dimensions: { longueur: 30, largeur: 15, hauteur: 50 },
        couleurs: ['White', 'Black'],
        tailles: ['Standard'],
        tags: ['desk', 'lamp', 'adjustable'],
        note_moyenne: 4.3,
        nombre_avis: 56,
        actif: true,
        en_vedette: false,
        sku: 'DL-001',
        meta_titre: 'Adjustable Desk Lamp - Perfect for Home Office',
        meta_description: 'Adjustable desk lamp with multiple brightness levels, perfect for your home office or study area.'
      },
      {
        nom: 'Coffee Maker',
        description: 'Programmable coffee maker for your perfect morning brew. Features multiple brew strengths and a built-in grinder.',
        prix: 79.99,
        prix_reduit: 59.99,
        categorie: 'Home',
        sous_categorie: 'Kitchen',
        marque: 'BrewMaster',
        images: [
          'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/1833651/pexels-photo-1833651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/6542420/pexels-photo-6542420.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ],
        stock: 12,
        poids: 3500,
        dimensions: { longueur: 25, largeur: 20, hauteur: 35 },
        couleurs: ['Stainless Steel', 'Black'],
        tailles: ['12-cup'],
        tags: ['coffee', 'programmable', 'grinder'],
        note_moyenne: 4.6,
        nombre_avis: 78,
        actif: true,
        en_vedette: true,
        sku: 'CM-001',
        meta_titre: 'Programmable Coffee Maker - Perfect Morning Brew',
        meta_description: 'Programmable coffee maker with multiple brew strengths and built-in grinder for your perfect morning brew.'
      }
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Create sample reviews
    console.log('Creating sample reviews...');
    await models.Review.bulkCreate([
      {
        product_id: products[0].id,
        user_id: users[0].id,
        note: 5,
        commentaire: 'Excellent sound quality and very comfortable!',
        approuve: true
      },
      {
        product_id: products[0].id,
        user_id: users[1].id,
        note: 4,
        commentaire: 'Great headphones, battery life is impressive.',
        approuve: true
      },
      {
        product_id: products[1].id,
        user_id: users[0].id,
        note: 5,
        commentaire: 'Perfect for tracking my workouts!',
        approuve: true
      }
    ]);
    console.log('✅ Created sample reviews');

    // Create sample favorites
    console.log('Creating sample favorites...');
    await models.Favorite.bulkCreate([
      {
        user_id: users[0].id,
        product_id: products[0].id
      },
      {
        user_id: users[0].id,
        product_id: products[1].id
      },
      {
        user_id: users[1].id,
        product_id: products[2].id
      }
    ]);
    console.log('✅ Created sample favorites');

    // Create sample addresses
    console.log('Creating sample addresses...');
    await models.Address.bulkCreate([
      {
        user_id: users[0].id,
        type: 'livraison',
        nom: 'Doe',
        prenom: 'John',
        adresse: '123 Main St',
        complement: 'Apt 4B',
        ville: 'New York',
        code_postal: '10001',
        pays: 'USA',
        telephone: '+1234567890',
        par_defaut: true
      },
      {
        user_id: users[1].id,
        type: 'livraison',
        nom: 'Smith',
        prenom: 'Jane',
        adresse: '456 Oak Ave',
        complement: '',
        ville: 'Los Angeles',
        code_postal: '90210',
        pays: 'USA',
        telephone: '+1234567891',
        par_defaut: true
      }
    ]);
    console.log('✅ Created sample addresses');

    console.log(`✅ Database seeded successfully with ${users.length} users, ${products.length} products, and sample data`);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

module.exports = { seedDatabase }; 