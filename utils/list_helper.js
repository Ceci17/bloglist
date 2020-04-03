const _ = require("lodash");

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

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
