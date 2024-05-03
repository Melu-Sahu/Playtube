import { asyncHandler } from "../utils/asyncHandelar.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../modles/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // Todo's

  // get user details
  const { fullname, username, email, password } = req.body;

  // validation
  if ([fullname].some((name) => name?.trim() === "")) {
    throw new ApiError(400, "fullname is missing.");
  }

  if (fullname.length < 3) {
    throw new ApiError(400, "fullname must contain at least 4 characters.");
  }

  if ([password].some((password) => password?.trim() === "")) {
    throw new ApiError(400, "Password is missing.");
  }
  if (password.length < 8) {
    throw new ApiError(400, "Password must contain at lease 8 characters");
  }

  if (
    (password) => {
      // Check if the password contains at least one uppercase letter
      const hasUppercase = /[A-Z]/.test(password);

      // Check if the password contains at least one special character
      const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\-\\/]/.test(password);

      // Check if the password contains at least one digit
      const hasDigit = /\d/.test(password);

      // Combine the checks
      const isValidPassword = hasUppercase && hasSpecialChar && hasDigit;

      return isValidPassword;
    }
  ) {
    throw new ApiError(
      400,
      "Password must have once 'Uppercase', once 'Special Characters' and once 'Number' characters."
    );
  }

  if ([username].some((name) => name?.trim() === "")) {
    throw new ApiError(400, "username is missing.");
  }

  if (username.length < 3) {
    throw new ApiError(400, "username must contain at least 4 characters.");
  }
  if ([email].some((email) => name?.trim() === "")) {
    throw new ApiError(400, "email is missing.");
  }

  if (
    (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\\]\\\\.,;:\\s@\"]+(\\.[^<>()[\\]\\\\.,;:\\s@\"]+)*)|.(\".+\"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$/
        );
    }
  ) {
    throw new ApiError(400, "Invalid email formate.");
  }

  // check if already exist : [username & email]
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "username or email already exists.");
  }

  // check for image

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // check for avatar

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar is missing.');
  }

  // upload them to cloudinary & get public url 

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverImageLocalPath);

  
  // create a user object - create user in DB

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverimage?.url || '',
    email,
    password,
    username
  })
  // remove password & refresh token field from response

  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  // check for user creation

  if(createdUser){

    throw new ApiError(500, 'Error while Registering user. Please try again.');
  }

  // return response
  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully.")
  )
});

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
