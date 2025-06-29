const { getSequelize } = require('./database/config');
const { initializeModels } = require('./database/models');

async function listUsers() {
    const sequelize = await getSequelize();
    const models = await initializeModels(sequelize);
    const users = await models.User.findAll();
    console.log('Users:');
    users.forEach(u => console.log({ id: u.id, nom: u.nom, email: u.email, role: u.role }));
    process.exit(0);
}

listUsers(); 