const express = require("express");
const app = express();
const mongoose = require("mongoose");

const expressSession = require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
});

app.use(express.json());
app.use(express.static(__dirname));

app.use(expressSession);
app.use(express.urlencoded({ extended: true }));

//Passport setup
const passport = require("passport");

app.use(passport.initialize());
app.use(passport.session());

const passportLocalMongoose = require("passport-local-mongoose");

mongoose.connect("mongodb://localhost/MyDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  passport: String,
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model("userInfo", UserDetail, "userInfo");

//PASSPORT LOCAL AUTHENTICATION
passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

//ROUTES
const connectEnsureLogin = require("connect-ensure-login");

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login?info=" + info);
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }

      return res.redirect("/");
    });
  })(req, res, next);
});

app.get("/login", (req, res) =>
  res.sendFile("html/login.html", { root: __dirname })
);

app.get("/", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.sendFile("html/index.html", { root: __dirname });
});

app.get("/private", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.sendFile("html/private.html", { root: __dirname });
});

app.get("/user", connectEnsureLogin.ensureLoggedIn(), (req, res) =>
  res.send({ user: req.user })
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("App listening on port " + port);
});

// UserDetails.register({ username: "paul", active: false }, "paul");
// UserDetails.register({ username: "jay", active: false }, "jay");
// UserDetails.register({ username: "roy", active: false }, "roy");
