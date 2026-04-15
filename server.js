const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());

// ================= PORT =================
const PORT = process.env.PORT || 5000;

// ================= DB =================
mongoose.connect("mongodb+srv://admin:admin123@cluster0.hgm7qzu.mongodb.net/socialApp?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// ================= SCHEMA =================
const User = mongoose.model("User", {
  username: String,
  email: { type: String, unique: true },
  password: String
});

const Post = mongoose.model("Post", {
  content: String,
  likes: { type: Number, default: 0 }
});

// ================= TEST =================
app.get("/test", (req, res) => {
  res.json({ message: "Server working ✅" });
});

// ================= SIGNUP =================
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.json({ message: "User already exists ❌" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hash
    });

    res.json({ message: "Signup successful ✅", user });
  } catch (err) {
    res.json({ message: "Signup error ❌" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "User not found ❌" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Wrong password ❌" });

    res.json({ message: "Login successful ✅", user });
  } catch (err) {
    res.json({ message: "Login error ❌" });
  }
});

// ================= GET POSTS =================
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ _id: -1 });
    res.json(posts);
  } catch (err) {
    res.json({ message: "Error fetching posts ❌" });
  }
});

// ================= ADD POST =================
app.post("/posts", async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Post.create({ content });

    res.json({ message: "Post added ✅", post });
  } catch (err) {
    res.json({ message: "Error adding post ❌" });
  }
});

// ================= LIKE POST =================
app.post("/posts/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.json({ message: "Post not found ❌" });

    post.likes++;
    await post.save();

    res.json({ message: "Liked ✅", post });
  } catch (err) {
    res.json({ message: "Error liking post ❌" });
  }
});

// ================= DELETE POST =================
app.delete("/posts/:id", async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted ✅" });
  } catch (err) {
    res.json({ message: "Error deleting ❌" });
  }
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
