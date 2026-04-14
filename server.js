const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.urlencoded({ extended: true }));

// ================= PORT FIX =================
const PORT = process.env.PORT || 5000;

// ================= DB CONNECTION =================
mongoose.connect("mongodb+srv://admin:admin123@cluster0.hgm7qzu.mongodb.net/socialApp?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

// ================= SCHEMA =================
const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String
});

const Post = mongoose.model("Post", {
  content: String,
  likes: { type: Number, default: 0 }
});

// ================= TEST ROUTE =================
app.get("/test", (req, res) => {
  res.send("<h1>Server is working ✅</h1>");
});

// ================= HOME =================
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find();

    res.send(`
    <html>
    <head>
      <title>Social Media App</title>
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
  } catch (err) {
    res.send("<h2>Error loading page</h2>");
  }
});

// ================= SIGNUP =================
app.get("/signup", (req, res) => {
  res.send(`
  <h2>Signup</h2>
  <form action="/signup" method="POST">
    <input name="username" placeholder="Username" required/><br/>
    <input name="email" placeholder="Email" required/><br/>
    <input name="password" type="password" placeholder="Password" required/><br/>
    <button>Signup</button>
  </form>
  `);
});

app.post("/signup", async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);

  await User.create({
    username: req.body.username,
    email: req.body.email,
    password: hash
  });

  res.redirect("/login");
});

// ================= LOGIN =================
app.get("/login", (req, res) => {
  res.send(`
  <h2>Login</h2>
  <form action="/login" method="POST">
    <input name="email" placeholder="Email" required/><br/>
    <input type="password" name="password" placeholder="Password" required/><br/>
    <button>Login</button>
  </form>
  `);
});

app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) return res.send("User not found");

  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) return res.send("Wrong password");

  res.send("<h2>Login Successful ✅</h2><a href='/'>Go Home</a>");
});

// ================= POSTS =================
app.post("/add", async (req, res) => {
  await Post.create({ content: req.body.content });
  res.redirect("/");
});

app.post("/like/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (post) {
    post.likes++;
    await post.save();
  }
  res.redirect("/");
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
