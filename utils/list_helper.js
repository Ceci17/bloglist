const _ = require("lodash");

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url:
      "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url:
      "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url:
      "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }
];

const dummy = blogs => 1;

const totalLikes = blogs =>
  blogs.length
    ? blogs.map(blog => blog.likes).reduce((acc, curr) => acc + curr, 0)
    : 0;

const favoriteBlog = blogs => {
  const mostLikes = Math.max(...blogs.map(blog => blog.likes));
  const list = blogs.map(blog => {
    const { _id, __v, url, ...rest } = blog;
    return rest;
  });

  return list.find(blog => blog.likes === mostLikes);
};

const mostBlogs = blogs => {
  const authors = Object.entries(_.countBy(blogs, "author")).map(blog => {
    const [author, blogs] = blog;
    return {
      author,
      blogs
    };
  });

  const maxBlogs = Math.max(...authors.map(author => author.blogs));
  return authors.find(author => author.blogs === maxBlogs);
};

const mostLikes = blogs => {
  const authors = blogs.map(blog => {
    const { author, likes } = blog;
    return {
      author,
      likes
    };
  });
  const maxLikes = Math.max(...authors.map(author => author.likes));
  return authors.find(author => author.likes === maxLikes);
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
  blogs
};
