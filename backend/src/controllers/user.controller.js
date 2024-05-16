import { asyncHandler } from "../utils/asyncHandelar.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../modles/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  // Todo's
  // get user details
  const { fullname, username, email, password } = req.body;

  // validation
  if ([fullname].some((name) => name?.trim() === "")) {
    throw new ApiError(400, "fullname is missing.");
  }

  if (String(fullname).length <= 3) {
    throw new ApiError(400, "fullname must contain at least 4 characters.");
  }

  if ([password].some((password) => password?.trim() === "")) {
    throw new ApiError(400, "Password is missing.");
  }
  if (String(password).length < 8) {
    throw new ApiError(400, "Password must contain at lease 8 characters");
  }

  // if (
  //   () => {
  //     // At least one uppercase letter, one digit, and one special character
  //     const pattern =
  //       /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  //     return pattern.test(password);
  //   }
  // ) {
  //   throw new ApiError(
  //     400,
  //     "Password must have once 'Uppercase', once 'Special Characters' and once 'Number' characters."
  //   );
  // }

  if ([username].some((name) => name?.trim() === "")) {
    throw new ApiError(400, "username is missing.");
  }

  if (String(username).length <= 3) {
    throw new ApiError(400, "username must contain at least 4 characters.");
  }

  if ([email].some((email) => email?.trim() === "")) {
    throw new ApiError(400, "email is missing.");
  }

  // if (
  //   () => {
  //     const emailRegx = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  //     return emailRegx.test(email);
  //   }
  // ) {
  //   throw new ApiError(400, "Invalid email formate.");
  // }

  // check if already exist : [username & email]
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "username or email already exists.");
  }

  // check for images

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // check for avatar

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is missing.");
  }

  // upload them to cloudinary & get public url

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverImageLocalPath);

  // create a user object - create user in DB

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverimage?.url || "",
    email,
    password,
    username,
  });

  // console.log("User is", user);
  // remove password & refresh token field from response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Error while Registering user. Please try again.");
  }

  // return the response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully."));
});

//Login Controller.

const loginUser = asyncHandler(async (req, res) => {
  // Todo's
  // get user details

  const { email, username, password } = req.body;

  // console.log("email", email);
  // console.log("username", username);
  // console.log("password", password);

  // if (!username && !email) {
  //   throw new ApiError(400, "username or email is required....");
  // }

  if (!(username || email)) {
    throw new ApiError(400, "username or email is required.....");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log("User", user);

  if (!user) {
    throw new ApiError(404, "User not found. Please register.");
  }

  const isPasswordValild = await user.isPasswordCorrect(password);

  // console.log("ispasswordvalid",isPasswordValild);

  if (!isPasswordValild) {
    throw new ApiError(401, "Invalid user credentials.");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // console.log("Accesstoken", accessToken);
  // console.log("Accesstoken", refreshToken);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // console.log("Loggedin user", loggedInUser);

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfylly."
      )
    );
});

// Logout

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken._id);
  
    if (!user) {
      throw new ApiError(401, "Invalid refresh token.");
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used.");
    }
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
  
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiError(
          200, 
          {
            accessToken: accessToken,
            refreshToken: newRefreshToken
          }, 
          "Access token refreshed."
        )
      )
  
  
  } catch (error) {
    throw new ApiError(500, error?.message || "Invalid Refresh Token");
  }

  });

// Generate Access and refresh tokens.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access & refresh token."
    );
  }
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };
