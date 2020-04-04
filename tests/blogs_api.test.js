const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");

const api = supertest(app);
const Blog = require("../models/blog");
const helper = require("../utils/test_helper");

beforeEach(async () => {
  await Blog.deleteMany({});

  const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
  const promiseArray = blogObjects.map(blog => blog.save());
  await Promise.all(promiseArray);
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body.length).toBe(helper.initialBlogs.length);
});

test("unique identifier is returned as id", async () => {
  const response = await api.get("/api/blogs");

  response.body.map(blog => {
    const { id } = blog;
    expect(id).toBeDefined();
  });
});

test("successfully creates a new blog post", async () => {
  const newBlog = new Blog({
    title:
      "Structure and Interpretation of Computer Programs — JavaScript Adaptation",
    author: "Martin Henz and Tobias Wrigstad",
    url: "https://sicp.comp.nus.edu.sg",
    likes: 0
  });

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const contents = blogsAtEnd.map(blog => blog.title);
  expect(contents).toContain(
    "Structure and Interpretation of Computer Programs — JavaScript Adaptation"
  );
});

test("if the likes property is missing from the request, it will default to the value 0", async () => {
  const newBlog = new Blog({
    title:
      "Yoga Effects on Brain Health: A Systematic Review of the Current Literature",
    author: "Neha P. Gothea, Imadh Khan",
    url: "https://content.iospress.com/articles/brain-plasticity/bpl190084"
  });

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

  const contents = blogsAtEnd.map(blog => blog.title);
  expect(contents).toContain(
    "Yoga Effects on Brain Health: A Systematic Review of the Current Literature"
  );

  const found = blogsAtEnd.find(
    blog =>
      blog.title ===
      "Yoga Effects on Brain Health: A Systematic Review of the Current Literature"
  );

  expect(found.likes).toBe(0);
});

test("if the title and url properties are missing from the request data, the backend responds with the status code 400 Bad Request.", async () => {
  const newBlog = new Blog({
    author: "Douglas Adams",
    likes: 42
  });

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(400);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
});

afterAll(() => {
  mongoose.connection.close();
});
