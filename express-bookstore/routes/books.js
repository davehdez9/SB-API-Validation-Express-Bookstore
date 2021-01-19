const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError")

const jsonschema = require("jsonschema")
const bookSchema = require("../schemas/bookSchema.json")

const Book = require("../models/book");


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */
/**[] Implement validation for create a book - Display error messages containing all of the validation errors if books creations fails */

router.post("/", async function (req, res, next) {
  
  try {
    const validation = jsonschema.validate(req.body, bookSchema)
    if(!validation.valid){
      const listOfErrors = validation.errors.map(e => e.stack)
      const err = new ExpressError(listOfErrors, 400)
      return next(err)
    }
    const book = await Book.create(req.body)
    return res.status(201).json({ book });
  } catch (error) {
    return next(error)
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */
/**[] Implement validation for Update a book - Display error messages containing all of the validation errors if books update fails */

router.put("/:isbn", async function (req, res, next) {
  try {
    // if("isbn" in req.body){
    //   const err = new ExpressError("Not allowed to Edit", 400)
    //   return next(err)
    // }
    const validation = jsonschema.validate(req.body, bookSchema)
    if(!validation.valid){
      const listOfErrors = validation.errors.map(e => e.stack)
      const err = new ExpressError(listOfErrors, 400)
      return next(err)
    }
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
