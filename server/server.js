const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const Post = require("./models/Post");
const Comment = require("./models/Comment");

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../client")));

// Replace with your MongoDB connection string if different
const MONGO_URI = "mongodb://127.0.0.1:27017/blog";

let isUsingMemory = false;
const memoryStore = {
  posts: [],
  comments: []
};

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => {
    console.error("Could not connect to MongoDB. Switching to In-Memory mode.", err.message);
    isUsingMemory = true;
  });

// 📌 Создать пост
app.post("/posts", async (req, res) => {
  try {
    if (isUsingMemory) {
      const post = { ...req.body, _id: Date.now().toString(), createdAt: new Date() };
      memoryStore.posts.unshift(post);
      return res.json(post);
    }
    const post = new Post(req.body);
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Получить все посты
app.get("/posts", async (req, res) => {
  try {
    if (isUsingMemory) {
      return res.json(memoryStore.posts);
    }
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Получить пост по ID
app.get("/posts/:id", async (req, res) => {
  try {
    if (isUsingMemory) {
      const post = memoryStore.posts.find(p => p._id === req.params.id);
      const comments = memoryStore.comments.filter(c => c.postId === req.params.id);
      return res.json({ post, comments });
    }
    const post = await Post.findById(req.params.id);
    const comments = await Comment.find({ postId: req.params.id }).sort({ createdAt: -1 });
    res.json({ post, comments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 💬 Добавить комментарий
app.post("/comments", async (req, res) => {
  try {
    if (isUsingMemory) {
      const comment = { ...req.body, _id: Date.now().toString(), createdAt: new Date() };
      memoryStore.comments.unshift(comment);
      return res.json(comment);
    }
    const comment = new Comment(req.body);
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
