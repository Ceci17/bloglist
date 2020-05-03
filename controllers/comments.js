const commentsRouter = require("express").Router();
const Comment = require("../models/comment");
const Blog = require("../models/blog");

commentsRouter.get("/:id/comments", async (_request, response) => {
  const comments = await Comment.find({}).populate("blog", { id: 1 });
  console.log("comments", comments);
  response.json(comments);
});

commentsRouter.post("/:id/comments", async (request, response) => {
  const body = request.body;
  const blogId = request.params.id;
  console.log("params", request.params);

  const comment = new Comment({
    content: body.content,
    blog: blogId,
  });

  const blog = await Blog.findById(blogId);

  const savedComment = await comment.save();
  console.log("savedComment", savedComment);

  //   const updatedComment = {
  //     id: savedComment._id,
  //     content: savedComment.content,
  //     blog: { id: savedComment.blog },
  //   };
  //   console.log("updatedComment", updatedComment);
  blog.comments = blog.comments.concat(savedComment);
  await blog.save();
  console.log("blog", blog);
  response.json(savedComment);
});

module.exports = commentsRouter;
