const listHelper = require("../utils/list_helper");
const blogs = listHelper.blogs;

test("dummy returns one", () => {
  const blogs = [];

  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe("total likes", () => {
  test("when list has only one blog equals the likes of that", () => {
    const listWithOneBlog = [
      {
        _id: "5a422aa71b54a676234d17f8",
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url:
          "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
      }
    ];

    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(5);
  });

  test("of a bigger list is calculated right", () => {
    const result = listHelper.totalLikes(blogs);
    expect(result).toBe(36);
  });

  test("of empty list is 0", () => {
    const emptyList = [];

    const result = listHelper.totalLikes(emptyList);
    expect(result).toBe(0);
  });
});

test("correctly returns blog with most likes", () => {
  const mostLikes = {
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    likes: 12
  };

  const result = listHelper.favoriteBlog(blogs);
  expect(result).toEqual(mostLikes);
});

test("correcty returns author with most blogs", () => {
  const mostBlogs = {
    author: "Robert C. Martin",
    blogs: 3
  };

  const result = listHelper.mostBlogs(blogs);
  expect(result).toEqual(mostBlogs);
});

test("correcty returns author with most likes", () => {
  const mostLikes = {
    author: "Edsger W. Dijkstra",
    likes: 12
  };

  const result = listHelper.mostLikes(blogs);
  expect(result).toEqual(mostLikes);
});
