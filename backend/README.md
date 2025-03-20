# backend/README.md

# Backend for Resume Management Application

This is the backend service for the Resume Management Application. It is built using TypeScript and Express.js, providing a RESTful API for managing user authentication, resumes, and user profiles.

## Project Structure

```
backend
├── src
│   ├── controllers        # Contains the logic for handling requests
│   ├── middleware         # Contains middleware functions for authentication and error handling
│   ├── models             # Defines the data models for User and Resume
│   ├── routes             # Defines the API routes
│   ├── services           # Contains business logic for authentication and resumes
│   ├── utils              # Utility functions for database connection and validation
│   ├── types              # TypeScript types and interfaces
│   ├── config.ts         # Configuration settings for the application
│   └── app.ts            # Entry point of the application
├── package.json           # NPM dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## API Endpoints

- **Authentication**
  - `POST /api/auth/login` - Login a user
  - `POST /api/auth/register` - Register a new user

- **Resumes**
  - `GET /api/resumes` - Retrieve all resumes
  - `POST /api/resumes` - Create a new resume
  - `PUT /api/resumes/:id` - Update a resume
  - `DELETE /api/resumes/:id` - Delete a resume

- **Users**
  - `GET /api/users/:id` - Retrieve user profile
  - `PUT /api/users/:id` - Update user information

## License

This project is licensed under the MIT License. See the LICENSE file for details.