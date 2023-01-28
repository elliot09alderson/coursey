import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { UserModel } from "../models/UserModel.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendEmail } from "../utils/sendEmal.js";
import { sendToken } from "../utils/sendToken.js";
import crypto from "crypto";
import { CourseModel } from "../models/CourseModel.js";

export const register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  // const file = req.file
  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  let user = await UserModel.findOne({ email });
  if (user) return next(new ErrorHandler("User already exist", 409));
  //upload file in cloudinary
  user = await UserModel.create({
    email,
    name,
    password,
    avatar: {
      public_id: "tempid",
      url: "tempurl",
    },
  });
  sendToken(res, user, "Registered successfully", 201);
});

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  // const file = req.file
  if (!email || !password)
    return next(new ErrorHandler("Please enter all fields", 400));

  let user = await UserModel.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));
  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or Password", 401));
  //upload file in cloudinary

  sendToken(res, user, `Welcome back, ${user.name} `, 200);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      // secure:true,
      sameSite: "none",
    })
    .json({ success: true, message: "Logged Out Successfully" });
});

export const getMyProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id);
  res.status(200).json({ success: true, user: user });
});

export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("please add all fields ", 400));
  }
  const user = await UserModel.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) return next(new ErrorHandler("incorrect old password", 400));
  user.password = newPassword;
  await user.save();
  res
    .status(200)
    .json({ success: true, message: "password changed successfully" });
});
//----------------------UPDATE PROFILE ----------------------------

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await UserModel.findById(req.user._id);
  if (name) user.name = name;
  if (email) {
    let emailCheck = await UserModel.findOne({ email });
    if (emailCheck)
      return next(new ErrorHandler("email is taken by other user"), 400);

    user.email = email;
  }

  await user.save();
  res
    .status(200)
    .json({ success: true, message: "Profile updated successfully" });
});

export const updateProfilePicture = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
  });
});

//----------------------FORGET PASSWORD ----------------------------
export const forgetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found"), 400);

  const resetToken = await user.getResetToken();
  await user.save();

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  // send token via mail
  const message = `Click on the link to reset password. ${url}.If you not requested then please ignore`;
  await sendEmail(user.email, "Coursey reset password", message);
  //-------------------------------------------------------------------------------
  res.status(200).json({
    success: true,
    message: `reset token has been sent to ${user.email}`,
  });
});



//----------------------RESET PASSWORD ----------------------------

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expired", 401));
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: "password changed successfully",
  });
});



//---------------------- ADD TO PPLAYLIST ----------------------------

export const addToPlaylist =catchAsyncErrors(async (req,res,next)=>{
  const user  =  await UserModel.findById(req.user._id)
  const course = await CourseModel.findById(req.body.id)  
  if(!course) return next(new ErrorHandler("Invalid Course Id",404))
  const itemExist  = user.playlist.find((item)=>{
    if(item.course.toString() === course._id.toString()) return true;
  })
  if(itemExist) return next(new ErrorHandler("Item Already Exist",409))
  user.playlist.push({
    course:course._id,
    poster:course.poster.url
  })
  await user.save()
  res.status(200).json({
    success:true, 
    message:"Added to playlist"
  })
})

//---------------------- REMOVE FROM PLAYLIST ----------------------------

export const removeFromPlaylist =catchAsyncErrors(async (req,res,next)=>{
  const user = await UserModel.findById(req.user._id);
  const course = await CourseModel.findById(req.query.id)
  if(!course) return next(new ErrorHandler("Invalid Course Id",404));

  const newPlaylist = user.playlist.filter((item)=>{
    if(item.course.toString() !== course._id.toString())return item;
  });
  user.playlist = newPlaylist;
  await user.save();
  res.status(200).json({
    success:true,
    message:"Removed from playlist"
  });
})