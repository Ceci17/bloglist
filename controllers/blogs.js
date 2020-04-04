const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response, next) => {
  const blogs = await Blog.find({});
  return response.json(blogs);
});

blogsRouter.get("/:id", async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);
  return response.json(blog);
});

blogsRouter.post("/", async (request, response, next) => {
  if (!request.body.title && !request.body.url) {
    return response.status(400).json({ error: "name or url missing" });
  }
  if (!request.body.likes) request.body.likes = 0;

  const blog = new Blog(request.body);

  const result = await blog.save();
  return response.status(201).json(result);
});

blogsRouter.delete("/:id", async (request, response, next) => {
  await Blog.findByIdAndRemove(request.params.id);
  return response.status(204).end();
});

module.exports = blogsRouter;
