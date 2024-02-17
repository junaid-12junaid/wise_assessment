const express = require('express')
const router = express.Router()
const { authentication } = require("../MiddleWare/auth")
const {createUser,loginUser,checkin,checkout,monthlyreport}=require('../controllers/instructor')


router.post("/register", createUser)
router.post("/login", loginUser)
router.post("/checkin", authentication, checkin)
router.post("/checkout", authentication, checkout)
router.get("/monthlyreport/:instructorId/:month/:year",authentication,monthlyreport)




module.exports = router