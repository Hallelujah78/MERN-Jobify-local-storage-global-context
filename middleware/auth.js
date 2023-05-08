import jwt from "jsonwebtoken";
import User from "../models/User.js";
import * as CustomError from "../errors/index.js";
import createTokenUser from "../utils/createTokenUser.js";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomError.UnauthenticatedError("unauthenticated");
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const testUser = payload.userId === "6446d438c18d00c279afd42a";
    req.user = { userId: payload.userId, testUser };

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("authentication invalid");
  }
};

export default auth;
