const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  postId: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", CommentSchema);
