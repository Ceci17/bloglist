// TODO: Token Extractor middleware
// const jwt = require("jsonwebtoken");

// const tokenExtractor = (request, response, next) => {
//   try {
//     const token = req.headers.authorization.split(" ")[1];
//     const decodedToken = jwt.verify(token, process.env.SECRET);
//     const userId = decodedToken.userId;
//     if (request.body.userId && request.body.userId !== userId) {
//       throw "Invalid user ID";
//     } else {
//       next();
//     }
//   } catch {
//     response.status(401).json({
//       error: new Error("Invalid request!")
//     });
//   }
// };

const unknownEndpoint = (_, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, _, response, next) => {
  if (error.name === "CastError" && error.kind === "ObjectId") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({
      error: "invalid token"
    });
  }

  console.error(error.message);

  next(error);
};

module.exports = {
  unknownEndpoint,
  errorHandler
};
