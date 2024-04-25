import { asyncHandler } from "../utils/asyncHandelar.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../modles/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const registerUser = asyncHandler()

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email is required.");

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

  }
});

export { registerUser, loginUser };
