# Book Review API

A RESTful API for managing books and their reviews, built with Node.js, Express, and MongoDB

## Features

- User authentication using JWT
- CRUD operations for books
- Review system with ratings
- Search functionality
- Pagination support
- Input validation
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/tanbiralam/book-review-backend-assignment.git
cd book-review-backend-assignment
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/book-review-api
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=24h
```

4. Start the server:

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Documentation

### Authentication

#### Register a new user

```http
POST /api/signup
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Books

#### Create a new book (Authenticated)

```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Classic",
  "description": "A story of decadence and excess...",
  "publishedYear": 1925,
  "isbn": "978-0743273565"
}
```

#### Get all books (with pagination and filters)

```http
GET /api/books?page=1&limit=10&author=Fitzgerald&genre=Classic
```

#### Get book by ID (with reviews)

```http
GET /api/books/:id?page=1&limit=10
```

#### Search books

```http
GET /api/books/search?q=gatsby&page=1&limit=10
```

### Reviews

#### Create a review (Authenticated)

```http
POST /api/books/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "A masterpiece of American literature!"
}
```

#### Update a review (Authenticated)

```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review comment"
}
```

#### Delete a review (Authenticated)

```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

## Database Schema

### User

```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  timestamps: true
}
```

### Book

```javascript
{
  title: String,
  author: String,
  genre: String,
  description: String,
  publishedYear: Number,
  isbn: String,
  timestamps: true,
  virtuals: {
    reviews: [Review],
    averageRating: Number
  }
}
```

### Review

```javascript
{
  book: ObjectId (ref: Book),
  user: ObjectId (ref: User),
  rating: Number (1-5),
  comment: String,
  timestamps: true
}
```

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Design Decisions

1. **Authentication**: JWT was chosen for its stateless nature and scalability.
2. **Database**: MongoDB was selected for its flexibility with document structures and good Node.js integration.
3. **Validation**: express-validator is used for input validation to ensure data integrity.
4. **Pagination**: Implemented on both books and reviews to manage large datasets efficiently.
5. **Search**: Text indexes on book title and author for efficient search operations.

## Security Measures

1. Passwords are hashed using bcrypt
2. JWT tokens for authentication
3. Input validation and sanitization
4. MongoDB injection prevention
5. Rate limiting (TODO)
