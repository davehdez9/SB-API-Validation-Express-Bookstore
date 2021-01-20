process.env.NODE_ENV = "test"

const request = require("supertest")

const app = require("../app")
const db = require("../db")

let book_isbn;

beforeEach(async () => {
    let insertBookDb = await db.query(`
        INSERT INTO 
            books (isbn, amazon_url, author, language, pages, publisher, title, year)
            VALUES(
                '123456789',
                'https://amazon.com/other',
                'Daisy',
                'English',
                500,
                'Any Publisher',
                'My test book',
                2021)
            RETURNING isbn`)
    book_isbn = insertBookDb.rows[0].isbn
})

describe("POST /books", function(){
    test("Add a new Books", async function(){
        const response = await request(app)
            .post("/books")
            .send({
                isbn: '987654321',
                amazon_url: "https://twitter.com",
                author: "Steve Jobs",
                language: "english",
                pages: 500,
                publisher: "any tests",
                title: "Test Book",
                year: 2021
            })
        expect(response.statusCode).toBe(201)
        expect(response.body.book).toHaveProperty("isbn")
    })
})

describe("GET /books", function(){
    test("Get the list of the books", async function() {
        const response = await request(app).get(`/books`)
        const books = response.body.books;
        expect(books).toHaveLength(1)
        expect(books[0]).toHaveProperty("author")
    })
})

describe('GET /books/:isbn', function() {
    test("Get a single book", async function(){
        const response = await request(app)
            .get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty("isbn")
        expect(response.body.book.isbn).toBe(book_isbn)
    })

    test("Respond with 404 if a book was not found", async function(){
        const response = await request(app)
            .get(`/book/125`)
        expect(response.statusCode).toBe(404)
    })
})

describe('PUT /books/:id', function () {
    test("Update a selected book", async function(){
        const response = await request(app)
            .put(`/books/${book_isbn}`)
            .send({
                amazon_url: "https://taco.com",
                author: "mctest",
                language: "english",
                pages: 1000,
                publisher: "yeah right",
                title: "UPDATED BOOK",
                year: 2000
            })
        expect(response.body.book).toHaveProperty("isbn")
    })
})

describe("DELETE /books/:id", function(){
    test("Delete a book", async function(){
        const response = await request(app)
            .delete(`/books/${book_isbn}`)
        expect(response.body).toEqual({message: "Book deleted"})
    })
})

afterEach(async function(){
    await db.query('DELETE FROM BOOKS')
})

afterAll(async function() {
    await db.end()
})