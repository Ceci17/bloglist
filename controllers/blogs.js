const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (_request, response) => {
  const blogs = await Blog.find({})
    .populate("user", { username: 1, name: 1 })
    .populate("comments");
  return response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate("comments");
  if (blog) {
    return response.json(blog);
  } else {
    return response.status(404).end();
  }
});

blogsRouter.put("/:id", async (request, response) => {
  const body = request.body;

  const token = request.token;

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  if (!body.title || !body.url) {
    return response.status(400).json({ error: "name or url missing" });
  }

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    date: new Date(),
    // TODO: user: body.user.id?
  };
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  return response.json(updatedBlog);
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;

  const token = request.token;

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    date: new Date(),
    user: user._id,
  });

  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  const token = request.token;

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }

  const blog = await Blog.findById(request.params.id);

  if (blog.user === undefined) {
    return response.status(403).json({ error: "you don’t have permission" });
  }

  if (!(blog.user.toString() === decodedToken.id)) {
    return response.status(403).json({ error: "you don’t have permission" });
  }

  await blog.deleteOne();
  return response.status(204).end();
});

blogsRouter.post("/:id/comments", async (request, response) => {});

module.exports = blogsRouter;
