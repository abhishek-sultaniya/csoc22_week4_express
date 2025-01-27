const express = require("express");
const app = express();
var mongoose = require("mongoose");
var passport = require("passport");
var auth = require("./controllers/auth");
var store = require("./controllers/store");
// var User = require("./models/user");
const Book = require("./models/book");
const User = require("./models/user");
const Bookcopy = require("./models/bookCopy");
var localStrategy = require("passport-local");
//importing the middleware object to use its functions
var middleware = require("./middleware"); //no need of writing index.js as directory always calls index.js by default
var port = process.env.PORT || 3000;
var flash = require('connect-flash');

app.use(express.static("public"));

/*  CONFIGURE WITH PASSPORT */
app.use(
  require("express-session")({
    secret: "decryptionkey", //This is the secret used to sign the session ID cookie.
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize()); //middleware that initialises Passport.
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); //used to authenticate User model with passport
passport.serializeUser(User.serializeUser()); //used to serialize the user for the session
passport.deserializeUser(User.deserializeUser()); // used to deserialize the user

app.use(express.urlencoded({ extended: true })); //parses incoming url encoded data from forms to json objects
app.set("view engine", "ejs");
app.use(flash());
app.use(function(req, res, next){
  res.locals.message = req.flash();
  next();
});

//THIS MIDDLEWARE ALLOWS US TO ACCESS THE LOGGED IN USER AS currentUser in all views
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

/* TODO: CONNECT MONGOOSE WITH OUR MONGO DB  */
const connectDB = async () => {
  try {
    // mongodb connection string
    var mongoDB =
      "mongodb://monu:monu@cluster0-shard-00-00.fd8mg.mongodb.net:27017,cluster0-shard-00-01.fd8mg.mongodb.net:27017,cluster0-shard-00-02.fd8mg.mongodb.net:27017/?ssl=true&replicaSet=atlas-mu9ebx-shard-0&authSource=admin&retryWrites=true&w=majority";
    const con = await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });

    console.log(`MongoDB connected : ${con.connection.host}`);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};
connectDB();

app.get("/", (req, res) => {
  res.render("index", { title: "Library" });
});

/*-----------------Store ROUTES
TODO: Your task is to complete below controllers in controllers/store.js
If you need to add any new route add it here and define its controller
controllers folder.
*/

app.get("/books", store.getAllBooks);

app.get("/book/:id",middleware.isLoggedIn,store.getBook);

app.get(
  "/books/loaned",
  //TODO: call a function from middleware object to check if logged in (use the middleware object imported)
  middleware.isLoggedIn,
  store.getLoanedBooks
);

app.post(
  "/books/issue",
  //TODO: call a function from middleware object to check if logged in (use the middleware object imported)
  middleware.isLoggedIn,
  store.issueBook
);

app.post("/books/search-book", store.searchBooks);

/* TODO: WRITE VIEW TO RETURN AN ISSUED BOOK YOURSELF */
app.post("/books/return",middleware.isLoggedIn, store.returnBooks);


/*-----------------AUTH ROUTES
TODO: Your task is to complete below controllers in controllers/auth.js
If you need to add any new route add it here and define its controller
controllers folder.
*/

app.get("/login", auth.getLogin);

app.post("/login", auth.postLogin);

app.get("/register", auth.getRegister);

app.post("/register", auth.postRegister);

app.get("/logout", auth.logout);

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
