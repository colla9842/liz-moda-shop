require('dotenv').config();
const cloudinary = require('cloudinary').v2;

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'tu_clave_secreta',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};

cloudinary.config({
  cloud_name: 'du3ycwhmx',
  api_key: '652461147199923',
  api_secret: 'hoAtCzASC9LgscVgxhvrEJer_wI'
});

module.exports = cloudinary;
