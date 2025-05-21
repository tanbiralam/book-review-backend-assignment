const express = require("express");
const { body, query, validationResult } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const Book = require("../models/book.model");

const router = express.Router();

// Validation middleware
const validateBook = [
  body("title").trim().notEmpty(),
  body("author").trim().notEmpty(),
  body("genre").trim().notEmpty(),
  body("description").trim().notEmpty(),
  body("publishedYear")
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() }),
  body("isbn").optional().trim(),
];

// Create a new book (authenticated)
router.post("/", auth, validateBook, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating book", error: error.message });
  }
});

// Get all books with pagination and filters
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.author) filter.author = new RegExp(req.query.author, "i");
    if (req.query.genre) filter.genre = new RegExp(req.query.genre, "i");

    const books = await Book.find(filter).skip(skip).limit(limit).populate({
      path: "reviews",
      select: "rating",
    });

    const total = await Book.countDocuments(filter);

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// Get book by ID with reviews
router.get("/:id", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const book = await Book.findById(req.params.id).populate({
      path: "reviews",
      options: {
        skip,
        limit,
        sort: { createdAt: -1 },
      },
      populate: {
        path: "user",
        select: "username",
      },
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const totalReviews = await book.reviews.length;

    res.json({
      book,
      reviews: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching book", error: error.message });
  }
});

// Search books
router.get("/search", [query("q").trim().notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const searchQuery = req.query.q;
    const books = await Book.find(
      { $text: { $search: searchQuery } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments({
      $text: { $search: searchQuery },
    });

    res.json({
      books,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBooks: total,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching books", error: error.message });
  }
});

module.exports = router;
