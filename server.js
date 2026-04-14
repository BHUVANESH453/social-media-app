const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.urlencoded({ extended: true }));

// ================= DB CONNECTION =================
mongoose.connect("mongodb://localhost:27017/socialApp")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ================= SCHEMA =================
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

const postSchema = new mongoose.Schema({
  content: String,
  likes: { type: Number, default: 0 }
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// ================= HOME =================
app.get("/", async (req, res) => {
  const posts = await Post.find();

  res.send(`
  <html>
  <head>
    <style>
      body {
        font-family: Arial;
        background: linear-gradient(to right, #667eea, #764ba2);
        color: white;
        text-align: center;
      }
      .container {
        width: 60%;
        margin: auto;
      }
      .card {
        background: white;
        color: black;
        padding: 15px;
        margin: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
      }
      input {
        padding: 10px;
        width: 60%;
        border-radius: 5px;
        border: none;
      }
      button {
        padding: 10px 15px;
        background: #ff7eb3;
        border: none;
        color: white;
        border-radius: 5px;
        cursor: pointer;
      }
      button:hover {
        background: #ff4e9b;
      }
      a {
        color: yellow;
        margin: 10px;
        text-decoration: none;
        font-weight: bold;
      }
    </style>
  </head>

  <body>
    <h1>🌐 Social Media App</h1>

    <a href="/signup">Signup</a> | 
    <a href="/login">Login</a>

    <div class="container">
      <form action="/add" method="POST">
        <input name="content" placeholder="Write something..." required/>
        <button type="submit">Post</button>
      </form>

      ${posts.map(post => `
        <div class="card">
          <p>${post.content}</p>
          <form action="/like/${post._id}" method="POST">
            <button>❤️ Like (${post.likes})</button>
          </form>
        </div>
      `).join("")}
    </div>
  </body>
  </html>
  `);
});

// ================= SIGNUP =================
app.get("/signup", (req, res) => {
  res.send(`
  <html>
  <head>
    <style>
      body {
        background: linear-gradient(to right, #ff758c, #ff7eb3);
        font-family: Arial;
        text-align: center;
        color: white;
      }
      form {
        background: white;
        color: black;
        padding: 20px;
        width: 300px;
        margin: auto;
        border-radius: 10px;
      }
      input {
        margin: 10px;
        padding: 10px;
        width: 90%;
      }
      button {
        background: #667eea;
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <h2>Signup</h2>
    <form action="/signup" method="POST">
      <input name="username" placeholder="Username" required/><br/>
      <input name="email" placeholder="Email" required/><br/>
      <input name="password" type="password" placeholder="Password" required/><br/>
      <button type="submit">Signup</button>
    </form>
  </body>
  </html>
  `);
});

app.post("/signup", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword
  });

  await user.save();
  res.redirect("/login");
});

// ================= LOGIN =================
app.get("/login", (req, res) => {
  res.send(`
  <html>
  <head>
    <style>
      body {
        background: linear-gradient(to right, #43cea2, #185a9d);
        font-family: Arial;
        text-align: center;
        color: white;
      }
      form {
        background: white;
        color: black;
        padding: 20px;
        width: 300px;
        margin: auto;
        border-radius: 10px;
      }
      input {
        margin: 10px;
        padding: 10px;
        width: 90%;
      }
      button {
        background: #ff7eb3;
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <h2>Login</h2>
    <form action="/login" method="POST">
      <input name="email" placeholder="Email" required/><br/>
      <input name="password" type="password" placeholder="Password" required/><br/>
      <button type="submit">Login</button>
    </form>
  </body>
  </html>
  `);
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.send("User not found");

  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) return res.send("Wrong password");

  res.send("<h2>Login Successful</h2><a href='/'>Go Home</a>");
});

// ================= POSTS =================
app.post("/add", async (req, res) => {
  const post = new Post({
    content: req.body.content
  });

  await post.save();
  res.redirect("/");
});

app.post("/like/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  post.likes += 1;
  await post.save();
  res.redirect("/");
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("Server running at http://localhost:5000");
});