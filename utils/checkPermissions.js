import { UnauthorizedError } from "../errors/index.js";

const checkPermissions = (requestUser, resourceUserId) => {
  // if (request.user.role === "admin") return;
  if (user.userId !== resourceUserId.toString()) {
    throw new CustomError.UnauthorizedError(
      "you do not have permission to access this resource"
    );
  }
};

export default checkPermissions;
