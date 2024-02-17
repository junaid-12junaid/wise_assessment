const { isValidObjectId } = require("mongoose");
const instructorModel = require("../Models/instuctor");
const instructorUserModel = require("../Models/instructorUser");
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
let moment=require("moment")

const {isValid,isVAlidRequestBody,nameRegex,emailRegex,isValidPassword,dateTime}=require('../validators/validator')

const createUser = async function (req, res) {
    try {
           const data = req.body
          
           if (!isVAlidRequestBody(data)) {
               return res.status(400).send({ status: false, message: "Please give the Input to Create the User" })
           }
   
           const { name,email, password} = data
   
    
        if (!isValid(name)) {
               return res.status(400).send({ status: false, message: 'Name is mandatory and should have non empty String' })
           }
   
           if (!nameRegex.test(name)) {
               return res.status(400).send({ status: false, message: "please provide Valid Name" })
           }
 
   
           if (!isValid(email)) {
               return res.status(400).send({ status: false, message: 'Email is mandatory and should have non empty String' })
           }
   
           if (!emailRegex.test(email)) {
               return res.status(400).send({ status: false, message: "please provide Valid Email" })
           }
   
           const isEmailAlreadyUsed = await instructorUserModel.findOne({ email })
           if (isEmailAlreadyUsed) {
               return res.status(400).send({ status: false, message: "Email Already Registered" })
           }
   
           if (!isValid(password)) {
               return res.status(400).send({ status: false, message: 'Password is mandatory and should have non empty String' })
           }
   
           if(!isValidPassword(password)) { 
               return res.status(400).send({status: false, message: 'please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15' })
       }
   
       const encyptPassword = await bcrypt.hash(password, 10)

       data.password=encyptPassword
       
   
           const newUser = await instructorUserModel.create(data)
           return res.status(201).send({ status: true, message: 'Success', data: newUser })
   
       }
       catch (err) {
           return res.status(500).send({ status: false, error: err.message });
       }
   };
   
   
   
 
   const loginUser = async function (req, res) {
    try {
        let data = req.body
        const { email, password } = data
        
        if (!isVAlidRequestBody(data)) return res.status(400).send({ status: false, message: "Email and Password Required !" })

       
        if (!email) return res.status(400).send({ status: false, message: "email is required" })


     
        if (!password) return res.status(400).send({ status: false, message: "password is required" })

      
        const user = await instructorUserModel.findOne({ email: email })
        if (!user) return res.status(400).send({ status: false, message: "Email is Invalid Please try again !!" })

        const verifyPassword = await bcrypt.compare(password, user.password)

        if (!verifyPassword) return res.status(400).send({ status: false, message: "Password is Invalid Please try again !!" })


        
        const token = jwt.sign({
            userId: user._id.toString()
        }, "wise_private_key", { expiresIn: '25h' })

        res.setHeader("x-api-key", token)

        let obj = {
        instructorId: user._id,
            token: token
        }

        res.status(200).send({ status: true, message: "User login successfull", data: obj })
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

   

let checkin= async (req, res) => {

    try {

    const { instructorId, checkInTime } = req.body;
    
        const decodedToken = req.decodedToken

        if (!isVAlidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Please give the Input to check in" })
        }

        if (!isValid(instructorId)) {
            return res.status(400).send({ status: false, message: 'instructorId is mandatory and should have non empty String' })
        }

        if (!isValidObjectId(instructorId)) return res.status(400).send({ status: false, message: 'instructorId is not valid' })

        if (!isValid(checkInTime)) {
            return res.status(400).send({ status: false, message: 'checkInTime is mandatory and should have non empty String' })
        }

        if (!dateTime.test(checkInTime)) {
            return res.status(400).send({ status: false, message: "Please provide date time in this formate only  YYYY-MM-DD HH:mm:ss" })
        }


        let user = await instructorUserModel.findById(instructorId)

        if (!user) return res.status(404).send({ status: false, messgage: 'instructor not found' })

        if (instructorId !== decodedToken) return res.status(401).send({ status: false, messgage: 'Unauthorized access!' })

        let date=moment(checkInTime).format('YYYY-MM-DD')

        let filterstartdate=new Date(date),endDate=new Date(date).setHours(23, 59, 59, 999);
        console.log(filterstartdate,endDate)

        const checkOverLap = await instructorModel.findOne({
            instructorId,
            checkOutTime: { $exists: true }, 
            checkInTime: { $gte: filterstartdate,$lte:endDate}, 
          }).sort({createdAt:-1});

          if(checkOverLap){
            if(new Date(checkInTime)<=checkOverLap.checkOutTime) return res.status(400).send({ status: false, messgage: 'The check In time is Overlap' })
          }

          

        const existingAttendance = await instructorModel.findOne({
            instructorId,
            checkOutTime: { $exists: false }, // Check if check-out time doesn't exist
            checkInTime: { $gte: filterstartdate,$lte:endDate}, // Check for today's date
          });
          
          if (existingAttendance) {
            return res.status(400).send({ status:false,message: 'Check-in already recorded for today. Please check-out first.' });
          }
          
        
          const attendance = new instructorModel({ instructorId, checkInTime });
          await attendance.save();

      return  res.status(201).json({ status: true,message: "Check-in recorded successfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
};


let checkout=async (req, res) => {
 try {

        const { instructorId, checkOutTime } = req.body;
    
        const decodedToken = req.decodedToken

        if (!isVAlidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Please give the Input to check out" })
        }

        if (!isValid(instructorId)) {
            return res.status(400).send({ status: false, message: 'instructorId is mandatory and should have non empty String' })
        }

        if (!isValidObjectId(instructorId)) return res.status(400).send({ status: false, message: 'instructorId is not valid' })

        if (!isValid(checkOutTime)) {
            return res.status(400).send({ status: false, message: 'checkOutTime is mandatory and should have non empty String' })
        }

        if (!dateTime.test(checkOutTime)) {
            return res.status(400).send({ status: false, message: "Please provide date time in this formate only  YYYY-MM-DD HH:mm:ss" })
        }

        let user = await instructorUserModel.findById(instructorId)

        if (!user) return res.status(404).send({ status: false, messgage: 'instructor not found' })

        if (instructorId !== decodedToken) return res.status(401).send({ status: false, messgage: 'Unauthorized access!' })

        let date=moment(checkOutTime).format('YYYY-MM-DD')

        let filterstartdate=new Date(date),endDate=new Date(date).setHours(23, 59, 59, 999);
     

        const existingAttendance = await instructorModel.findOne({
            instructorId,
            checkOutTime: { $exists: false },
            checkInTime: { $gte: filterstartdate,$lte:endDate}
          });
          
          if (existingAttendance) {

            let checkInDate=new Date(existingAttendance.checkInTime),checkOutDate=new Date(checkOutTime)

            if(checkOutDate<=checkInDate){
               return res.status(400).send({status:false, message: "Check-out date and time is invalid" });
            }

            existingAttendance.checkOutTime = checkOutTime;
            await existingAttendance.save();

          return  res.status(200).send({status:true, message: "Check-out recorded successfully" });
          }else{
            return res.status(400).send({ status:false,message: 'there is no Check-in found today. Please check-in first.' });
          }

       
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


let monthlyreport=  async (req, res) => {
    

    try {

        const { year, month ,instructorId} = req.params;

        const decodedToken = req.decodedToken

        if (!isVAlidRequestBody(req.params)) {
            return res.status(400).send({ status: false, message: "Please give the Input to check out" })
        }

        if (!isValid(instructorId)) {
            return res.status(400).send({ status: false, message: 'instructorId is mandatory and should have non empty String' })
        }

        if (!isValidObjectId(instructorId)) return res.status(400).send({ status: false, message: 'instructorId is not valid' })

        if (!isValid(year)) {
            return res.status(400).send({ status: false, message: 'year is mandatory and should have non empty String' })
        }

        if (!isValid(month)) {
            return res.status(400).send({ status: false, message: 'month is mandatory and should have non empty String' })
        }

        let user = await instructorUserModel.findById(instructorId)

        if (!user) return res.status(404).send({ status: false, messgage: 'instructor not found' })

        if (instructorId !== decodedToken) return res.status(401).send({ status: false, messgage: 'Unauthorized access!' })

    const startOfMonth = moment().year(year).month(month - 1).startOf('month');
    const endOfMonth = moment().year(year).month(month - 1).endOf('month');

        const monthlyReport = await instructorModel.aggregate([
            {
                $match: {
                    checkInTime: { $gte: startOfMonth.toDate(), $lte: endOfMonth.toDate() }
                }
            },
            {
                $group: {
                    _id: '$instructorId',
                    totalHours: { 
                        $sum: { 
                            $divide: [{ $subtract: ['$checkOutTime', '$checkInTime'] }, 3600000] 
                        } 
                    }
                }
            },
            {
                $lookup: {
                    from: "instructorusers", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "instructorData"
                }
            },
            {
                $unwind: "$instructorData"
            },
            {
                $project: {
                    _id:0,
                    instructorId: "$_id",
                    name: "$instructorData.name",
                    totalHours: 1,
                    
                }
            }
        ]);
 

        if(monthlyReport.length==0){
            return  res.status(400).send({status:false, message: "No data in this month"});
        }

        return  res.status(200).send({status:true, message: "The data of month",result:monthlyReport });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}







module.exports = { createUser,loginUser,monthlyreport, checkout, checkin }