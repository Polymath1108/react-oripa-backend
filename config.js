
// config.js
const config = {
    server: {
      PORT: 5000,
      HOST: 'localhost',
    },
    database: {
      HOST: '127.0.0.1',
      USER: 'root',
      PASSWORD: '',
      NAME: 'Oripa_DB',
    },
    api: {
      VERSION: 'v1',
      KEY: 'api_key',
    },
    admin_authority: {
      admin: "admin", //authority for managing administrator
      users: "users" //authority for managing users
      
    }
  };
  
  module.exports = config;