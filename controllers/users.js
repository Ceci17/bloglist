const usersRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

usersRouter.get("/", async (_, response, next) => {
  const users = await User.find({}).populate("blogs", { title: 1 });
  response.json(users);
});

usersRouter.post("/", async (request, response, next) => {
  const body = request.body;

  if (!body.password) {
    return response.status(400).json({
      error: "password is required field"
    });
  }

  if (body.password.trim().length < 3) {
    return response.status(400).json({
      error: "password must be minimum 3 charachters long"
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  });

  const savedUser = await user.save();

  response.json(savedUser);
});

module.exports = usersRouter;
