import express from 'express'
import { addToPlaylist, changePassword, forgetPassword, getMyProfile, login, logout, register, removeFromPlaylist, resetPassword, updateProfile, updateProfilePicture } from '../controllers/UserController.js'
import { isAuthenticated } from '../middlewares/auth.js';
const userRouter = express.Router()
//Register a new User
userRouter.route('/register').post(register);
//login
userRouter.route('/login').post(login);
//log out
userRouter.route('/logout').get(logout);
//get my profile
userRouter.route('/me').get(isAuthenticated, getMyProfile);
//change password
userRouter.route('/changepassword').put(isAuthenticated, changePassword);
//update Profile
userRouter.route('/updateprofile').put(isAuthenticated, updateProfile);
//update Profile picture
userRouter.route('/updateprofilepicture').put(isAuthenticated, updateProfilePicture);
//forget password
userRouter.route('/forgetpassword').post( forgetPassword);
//reset password
userRouter.route('/resetpassword/:token').put(resetPassword);

//add to playlist 
userRouter.route('/addtoplaylist').post(isAuthenticated,addToPlaylist)
//remove from plpaylist
userRouter.route('/removeplaylist').delete(isAuthenticated,removeFromPlaylist)


export default userRouter   