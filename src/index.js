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

var loggedIn = false;

//test data
//put users, userid, pdwd, and shopping cart data in database later
let userdetails = { username: "bob", password: "123" };




//logic in ejs file if not logged in
app.get("/", (req, res) => {  

  if(loggedIn)
  {
    let username = req.cookies.usernameLoggedIn;  
    res.render("home.ejs", {username})  
  }
  
  else
  {
    res.render("notLoggedIn.ejs") 
  }

  
});

app.use('/login',(req,res,next) => {
  console.log('test for LOGIN MIDDLEAWARE ONLY!!! function!')
  next();
})

app.get("/login", (req, res) => {
  
  if(loggedIn){
    res.render('login');
    // res.render('welcome') //no need to login, go to welcome
  }
  
  //failed login once before
  //re-render with message
  if(!loggedIn && failedLogin){
    res.render('login', { error: "Username or Password Incorrect." })
    
  }

  //login with no message
  if(!loggedIn && !failedLogin){
    res.render('login')
  }


});


//LOGIN PROCESS ********************************
//login page posts here!
app.post("/process_login", (req, res) => {
  
        // user and pdwd match then login
        if (req.body.username === userdetails["username"] && req.body.password === userdetails["password"]
        ) {
              loggedIn = true;
              req.session.username = req.body.username;

              res.redirect("/welcome");
          } 
        
        //for failed login
        else {
          failedLogin = true;
          res.redirect('/login')
        }
});

//*******************************************************************************************************
//can protect all routes after here
function checkLoggedIn(req,res,next){
  
  if(!loggedIn){
    res.render("notLoggedIn.ejs") 
  }

  else{
    console.log('first function');
    next();
  }

}

//only if logged in
//logic in welcome.ejs if not logged in
app.get("/welcome", checkLoggedIn, (req, res) => {

  if(loggedIn){
    let username = req.session.username;
    return res.render("welcome", {username});
  } 


});


app.get('/authorizedPage',checkLoggedIn, (req,res) => {

  let username = req.session.username;
  if(loggedIn) res.render('authorizedPage.ejs', {username})
  else res.render('login')

})

app.get("/logout", (req, res) => {

  res.clearCookie("connect.sid");
  loggedIn = false;

  return res.redirect("/login");
  
});





app.listen(4000, () => console.log(`server started on port: 4000`));