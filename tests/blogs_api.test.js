const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const app = require("../app");
const bcrypt = require("bcrypt");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("../utils/test_helper");

describe("login", () => {
  test("it should login successfully with correct credentials", async () => {
    await api
      .post("/api/login")
      .send({ username: "johhny", password: "cheepcheepcheep" })
      .expect(200);
  });
  test("it should respond with status 401 with wrong credentials", async () => {
    await api
      .post("/api/login")
      .send({ username: "johny", password: "cheepcheep" })
      .expect(401);
  });
});

describe("when there is initially one user at db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("secret", 10);
    const user = new User({
      username: "chicken_joe",
      name: "Chicken Joe",
      passwordHash,
    });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "johhny",
      name: "Tommy Wiseau",
      password: "cheepcheepcheep",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });
});

describe("when there is initially some notes saved", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.initialBlogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
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

    response.body.map((blog) => {
      const { id } = blog;
      expect(id).toBeDefined();
    });
  });

  describe("viewing a specific blog", () => {
    test("succeeds with a valid id", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const blogToView = blogsAtStart[0];

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      expect(resultBlog.body).toEqual(blogToView);
    });

    test("fails with statuscode 404 if blog does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
    });

    // test("fails with statuscode 400 if id is invalid", async () => {
    //   const invalidId = "5a3d5da59070081a82a3445";

    //   await api.get(`/api/blogs/${invalidId}`).expect(400);
    // });
  });

  describe("adition of a new blog", () => {
    let token = null;

    beforeAll(async () => {
      const response = await api
        .post("/api/login")
        .send({ username: "johhny", password: "cheepcheepcheep" });

      token = response.body.token;
    });

    test("successfully creates a new blog post if authenticated", async () => {
      const decodedToken = jwt.verify(token, process.env.SECRET);

      const user = await User.findById(decodedToken.id);

      const newBlog = new Blog({
        title:
          "Structure and Interpretation of Computer Programs — JavaScript Adaptation",
        author: "Martin Henz and Tobias Wrigstad",
        url: "https://sicp.comp.nus.edu.sg",
        user: user._id,
        likes: 0,
      });

      await api
        .post("/api/blogs")
        .set("Authorization", `bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      user.blogs = user.blogs.concat(newBlog);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

      const contents = blogsAtEnd.map((blog) => blog.title);
      expect(contents).toContain(
        "Structure and Interpretation of Computer Programs — JavaScript Adaptation"
      );
    });

    test("if the likes property is missing from the request, it will default to the value 0", async () => {
      const newBlog = new Blog({
        title:
          "Yoga Effects on Brain Health: A Systematic Review of the Current Literature",
        author: "Neha P. Gothea, Imadh Khan",
        url: "https://content.iospress.com/articles/brain-plasticity/bpl190084",
      });

      await api
        .post("/api/blogs")
        .set("Authorization", `bearer ${token}`)
        .send(newBlog)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);

      const contents = blogsAtEnd.map((blog) => blog.title);
      expect(contents).toContain(
        "Yoga Effects on Brain Health: A Systematic Review of the Current Literature"
      );

      const found = blogsAtEnd.find(
        (blog) =>
          blog.title ===
          "Yoga Effects on Brain Health: A Systematic Review of the Current Literature"
      );

      expect(found.likes).toBe(0);
    });

    test("if the title and url properties are missing from the request data, the backend responds with the status code 400 Bad Request.", async () => {
      const newBlog = new Blog({
        author: "Douglas Adams",
        likes: 42,
      });

      await api
        .post("/api/blogs")
        .set("Authorization", `bearer ${token}`)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
    });
  });

  describe("updating blog post", () => {
    let token = null;

    beforeAll(async () => {
      const response = await api
        .post("/api/login")
        .send({ username: "johhny", password: "cheepcheepcheep" });

      token = response.body.token;
    });

    test("successfully updates the blog post", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const blogToUpdate = blogsAtStart[0];

      const updatedBlog = {
        title: "Updated blog post",
        author: "Chicken Joe",
        url: "www.google.com",
        likes: 17,
      };

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set("Authorization", `bearer ${token}`)
        .send(updatedBlog)
        .expect(200);

      const blogsAtEnd = await helper.blogsInDb();

      const title = blogsAtEnd.map((blog) => blog.title);

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
      expect(title).not.toContain(blogToUpdate.title);
      expect(title).toContain("Updated blog post");
    });

    test("responds with status 400 if data is not valid", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const blogToUpdate = blogsAtStart[0];

      const updatedBlog = {
        author: "Chicken Joe",
        url: "www.google.com",
        likes: 17,
      };

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set("Authorization", `bearer ${token}`)
        .send(updatedBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      const title = blogsAtEnd.map((blog) => blog.title);

      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length);
      expect(title).toContain(blogToUpdate.title);
    });
  });

  describe("deletion of a blog", () => {
    let token = null;

    beforeAll(async () => {
      const response = await api
        .post("/api/login")
        .send({ username: "johhny", password: "cheepcheepcheep" });

      token = response.body.token;
    });

    test("succeeds with status code 204 if user has persmisson", async () => {
      const decodedToken = jwt.verify(token, process.env.SECRET);

      const user = await User.findById(decodedToken.id);

      const newBlog = new Blog({
        title: "Hello World",
        author: "Brian Kernighan",
        url:
          "https://stackoverflow.com/questions/602237/where-does-hello-world-come-from",
        user: user._id,
        likes: 1,
      });

      await api
        .post("/api/blogs")
        .set("Authorization", `bearer ${token}`)
        .send(newBlog);

      const blogsAtStart = await helper.blogsInDb();

      const blogToDelete = blogsAtStart.find(
        (blog) => blog.title === "Hello World"
      );

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

      const title = blogsAtEnd.map((blog) => blog.title);

      expect(title).not.toContain(blogToDelete.title);
    });

    test("responds with status code 401 Unauthorized if user don't have a permission", async () => {
      const decodedToken = jwt.verify(token, process.env.SECRET);

      const user = await User.findById(decodedToken.id);

      const blogsAtStart = await helper.blogsInDb();

      const blogToDelete = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `bearer ${token}`)
        .expect(403);

      const blogsAtEnd = await helper.blogsInDb();

      expect(blogsAtEnd).toHaveLength(blogsAtStart.length);

      const title = blogsAtEnd.map((blog) => blog.title);

      expect(title).toContain(blogToDelete.title);
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});
