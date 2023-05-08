import express from "express";
import authMiddleware from "../middleware/auth.js";
import testUser from "../middleware/testUser.js";
import {
  getAllJobs,
  deleteJob,
  updateJob,
  createJob,
  showStats,
} from "../controllers/jobsController.js";

const router = express.Router();

router
  .route("/")
  .get(authMiddleware, getAllJobs)
  .post(authMiddleware, testUser, createJob);
router.route("/stats").get(authMiddleware, showStats);
router
  .route("/:id")
  .delete(authMiddleware, testUser, deleteJob)
  .patch(authMiddleware, testUser, updateJob);

export default router;
