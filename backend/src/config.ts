// filepath: /backend/backend/src/config.ts
import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  db: {
    uri: process.env.DB_URI || 'mongodb://localhost:27017/mydatabase',
  },
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
};

export default config;