const express = require("express")
const { createHandler } = require("graphql-http/lib/use/express")
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require("graphql")
const { ruruHTML } = require("ruru/server")

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
]

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
]

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "Book Query",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: GraphQLNonNull(GraphQLInt),
    },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((author) => author.id === book.authorId)
      },
    },
  }),
})

AuthorType = new GraphQLObjectType({
  name: "Author",
  description: "Author Query",
  fields: () => ({
    id: {
      type: GraphQLNonNull(GraphQLInt),
    },
    name: {
      type: GraphQLNonNull(GraphQLString),
    },
    books: {
      type: GraphQLList(BookType),
      resolve: (source) => books.filter((book) => book.authorId === source.id),
    },
  }),
})

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    book: {
      type: BookType,
      description: "Query for a specific book",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (_, args) => books.find((book) => book.id === args.id),
    },
    author: {
      type: AuthorType,
      description: "Query for a specific author",
      args: {
        id: {
          type: GraphQLInt,
        },
      },
      resolve: (_, args) => authors.find((author) => author.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of All Books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of All Authors",
      resolve: () => authors,
    },
  }),
})

const schema = new GraphQLSchema({
  query: RootQueryType,
})

const root = {
  hello() {
    return "Hello world!"
  },
}

const app = express()

app.get("/", (_req, res) => {
  res.type("html")
  res.end(ruruHTML({ endpoint: "/graphql" }))
})

app.all(
  "/graphql",
  createHandler({
    schema: schema,
    rootValue: root,
  })
)

app.listen(5000, () => {
  console.log("Server running")
})
