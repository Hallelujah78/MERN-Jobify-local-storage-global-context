import { StatusCodes } from "http-status-codes";
import Job from "../models/Job.js";
import * as CustomError from "../errors/index.js";
import User from "../models/User.js";
import { checkPermissions } from "../utils/index.js";
import mongoose from "mongoose";
import moment from "moment";

const createJob = async (req, res) => {
  // company, position, status, type, location, createdBy
  const { company, position } = req.body;
  if (!company || !position) {
    throw new CustomError.BadRequestError(
      "please provide company and position"
    );
  }

  const user = await User.findOne({ _id: req.user.userId });
  if (!user) {
    throw new CustomError.NotFoundError("user not found");
  }
  const job = await Job.create({
    company,
    position,
    createdBy: req.user.userId,
  });
  res.status(StatusCodes.CREATED).json({ job });
};

const getAllJobs = async (req, res) => {
  // all jobs for specific user
  const { userId } = req.user;
  const { status, type, search, sort } = req.query;
  const queryObject = {
    createdBy: userId,
  };
  if (status && status !== "all") {
    queryObject.status = status;
  }
  if (type && type !== "all") {
    queryObject.type = type;
  }
  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }
  let result = Job.find(queryObject);
  // chain sort conditions here:
  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const jobs = await result;

  const totalJobs = await Job.countDocuments(queryObject);

  res.status(StatusCodes.OK).json({
    jobs,
    totalJobs,
    numOfPages: Math.ceil(totalJobs / limit),
  });
};
const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});
  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };
  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

const deleteJob = async (req, res) => {
  const { id: jobId } = req.params;
  const job = await Job.findOne({ _id: jobId });
  if (!job) {
    throw new CustomError.NotFoundError(`no job with id ${jobId}`);
  }
  // checkPermissions(req.user, job.createdBy);

  await Job.deleteOne({ _id: jobId });

  res.status(StatusCodes.OK).json({ msg: "job deleted successfully!" });
};

const updateJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { company, position } = req.body;

  if (!company || !position) {
    throw new CustomError.BadRequestError("please provide all values");
  }
  const job = await Job.findOne({ _id: jobId });

  if (!job) {
    throw new CustomError.NotFoundError(`job with id ${jobId} not found`);
  }

  // checkPermissions(req.user, job.createdBy);

  const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(StatusCodes.OK).json({ updatedJob });
};

export { getAllJobs, showStats, deleteJob, updateJob, createJob };
