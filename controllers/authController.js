import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import * as CustomError from "../errors/index.js";
import { createTokenUser } from "../utils/index.js";

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("please provide both values");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("invalid credentials");
  }
  const token = user.createJWT();
  const tokenUser = createTokenUser(user);

  res.status(StatusCodes.OK).json({ user: tokenUser, token });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw new CustomError.BadRequestError(
      "bad request, please provide all values"
    );
  }
  const userAlreadyExists = await User.findOne({ email });
  if (userAlreadyExists) {
    throw new CustomError.BadRequestError("user already exists");
  }
  const user = await User.create({ name, email, password });

  const token = user.createJWT();
  const tokenUser = createTokenUser(user);
  res.status(StatusCodes.CREATED).json({ user: tokenUser, token });
};

const logout = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "logout" });
};

const updateUser = async (req, res) => {
  const { email, name, lastName, location } = req.body;
  if (!email || !name || !lastName || !location) {
    throw new CustomError.BadRequestError("please provide all values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  user.lastName = lastName;
  user.location = location;
  await user.save();
  const token = user.createJWT();
  const tokenUser = createTokenUser(user);
  res
    .status(StatusCodes.OK)
    .json({ user: tokenUser, token, location: user.location });
};

export { login, register, logout, updateUser };
