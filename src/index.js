// src/index.js

// import all the modules/packages
const express = require("express");
const path = require("path");
const cookieparser = require("cookie-parser");
const session = require('express-session');
const app = express();

app.use(session({
    secret:'randomstring23234243asldkfjsdfssldkj',
    resave: true, //default is true, resaves to session store even if not modified
    httpOnly: false,
    saveUninitialized: true,
    cookie: {
      secure: false, //send back cookie if HTTPS connection or not
      signed: false}
  }))

// allow the app to use express

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "..", "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


//try global var over several requests
var globalBadAuth = true;  //not logged in by default
var failedLogin = false;

//test data
//put users, userid, pdwd, and shopping cart data in database later
let userdetails = { username: "bob", password: "123" };


app.use('/', (req,res,next) => {
  console.log('first function');
  next();
})

//logic in ejs file if not logged in
app.get("/", (req, res) => {  
  
  console.log(req.sessionID);
  // console.log(locals);


  if(req.cookies.usernameLoggedIn)
  {
    let username = req.cookies.usernameLoggedIn;  
    
    //home view file has logic if username is null
    res.render("home.ejs", {username})  
  }
  
  else
  {
    let notLoggedIn = true;
    res.render("notLoggedIn.ejs") 
  }

  
});

app.use('/login',(req,res,next) => {
  console.log('LOGIN MIDDLEAWARE ONLY!!! function!')
  next();
})

app.get("/login", (req, res) => {
  
  //beginning state:
  // var globalBadAuth = true;
  // var failedLogin = false;
  //so, if failedLogin occurs, it is then set to true and this will render going forward
  //if a real login occurs, globalBadAuth will be false
  
  

  if(globalBadAuth && failedLogin)
  {
      res.render("login", { error: "Invalid username or password silly goose" });
  } 
  else if(failedLogin == true){
    res.render('login', { error: "already logged in!" })
  }
  else res.render('login')

});


//LOGIN PROCESS ********************************
//login page posts here!
app.post("/process_login", (req, res) => {
  
        // user and pdwd match then login
        if (req.body.username === userdetails["username"] && req.body.password === userdetails["password"]
        ) {
              // saving the data to the cookies
              res.cookie("usernameLoggedIn", req.body.username);
              globalBadAuth = false;
              res.redirect("/welcome");
          } 
        
        // RE-RENDER login with a message on the query string
        else {
          failedLogin = true;
          res.redirect('/login')
        }
});

//only if logged in
//logic in welcome.ejs if not logged in
app.get("/welcome", (req, res) => {
  let username = req.cookies.usernameLoggedIn;
  return res.render("welcome", {username});
});


app.get('/authorizedPage', (req,res) => {
  let username = req.cookies.usernameLoggedIn;

  if(username) res.render('authorizedPage.ejs', {username})
  else res.render('login')
})

app.get("/logout", (req, res) => {

  res.clearCookie("usernameLoggedIn");
  globalBadAuth = true;
  failedLogin = false;
  return res.redirect("/login");
  
});





app.listen(4000, () => console.log(`server started on port: 4000`));