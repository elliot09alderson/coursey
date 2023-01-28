import express from 'express'
import { addLectures, createCourse, deleteCourse, getAllCourse, getCourseLectures } from '../controllers/CourseController.js'
import { authorizedAdmin, isAuthenticated } from '../middlewares/auth.js'
import singleUpload from '../middlewares/multer.js'
const courseRouter = express.Router()
courseRouter.route('/course')
.get(getAllCourse,)
.post(createCourse)
.delete(deleteCourse)
courseRouter.route('/createcourse').post(isAuthenticated,authorizedAdmin,singleUpload,createCourse)    

courseRouter.route("/course/:id").get(isAuthenticated, getCourseLectures).post(isAuthenticated,authorizedAdmin, singleUpload,addLectures).delete(isAuthenticated,authorizedAdmin,deleteCourse)



export default courseRouter
