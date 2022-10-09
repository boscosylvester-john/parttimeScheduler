const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Store = require("../models/store")
const Req = require("../models/requests")
var authenticateToken = require("../middleware/authenticateToken");
var adminAuth = require("../middleware/adminAuth");
const auth = require("../middleware/authentication");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");

//POST-method
//Add shift to user object
router.post("/addShift", async (req, res) => {
  try {
    console.log(req.body);
    const shiftFrom = new Date(req.body.shiftFrom);
    const shiftTill = new Date(req.body.shiftTill);
    const storeName = req.body.storeName;
    const sch = {
      shiftFrom: shiftFrom,
      shiftTill: shiftTill,
      storeName: storeName,
    };
    // console.log(sch);

    if (!shiftFrom || !shiftTill) {
      return res.status(400).send({ Message: "Time not in required format!"});
    }
    // Send response in here
    var f = await User.findOne({ email: req.body.email });
    f.shifts.push(sch);
    f.shiftHours += shiftTill.getHours()-shiftFrom.getHours();
    if (f.shiftHours>20) {
      return res.status(400).send({ Message: "Shift Hours exceeded! Cannot Add Shift"});
    }
    var week = shiftFrom.getDate()
    f.weekNumber = ~~(week/7);
    await f.save();
    res.status(200).send(f);
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).send({ Message: "User Already Exists" });
    } else {
      console.log(e);
      res.status(400).send(e);
    }
  }
});

// POST-method
// update shift details for a user
router.post("/updateShift", async (req, res) => {
    try{
        const shiftFrom = new Date(req.body.shiftFrom);
        const shiftTill = new Date(req.body.shiftTill);
        const storeName = req.body.storeName;
        const shiftId = req.body.shiftId;
        const sch = { 
            shiftFrom: shiftFrom, 
            shiftTill: shiftTill,
            storeName: storeName
        };
        
        if (!shiftFrom || !shiftTill) {
            return res.status(400).send({Message: "Time not in required format!"});
        }
        var f = await User.findOne({email: req.body.email});
        for(let shift of f["shifts"]){
            // console.log(shift["_id"] == shiftId);
            if(shift["_id"] == shiftId){
                shift["shiftFrom"] = shiftFrom;
                shift["shiftTill"] = shiftTill;
                shift["storeName"] = storeName;
                f.shiftHours = shiftTill.getHours()-shiftFrom.getHours();
                if (f.shiftHours>20) {
                  return res.status(400).send({ Message: "Shift Hours exceeded! Cannot Add Shift"});
                }
                var week = shiftFrom.getDate()
                f.weekNumber = ~~(week/7)+1;
                break;               
            }
        }
        f.save()
        res.status(200).send(f);
    }catch (e) {
        if (e.code === 11000) {
            res.status(409).send({ Message: "Shift not found" });
        } else {
        console.log(e);
        res.status(400).send(e);
        }
    }
});

//POST-method
//Offer Shift to Bidders or Traders
router.post("/offerShift", async (req, res) => {
  try {
    console.log(req.body);
    const shiftId = req.body.shiftId;
    var f = await User.findOne({ email: req.body.email });
    for(let shift of f["shifts"]){
      // console.log(shift["_id"] == shiftId);
      if(shift["_id"] == shiftId){
          shift["shiftToggle"] = 1;
          var reqs = new Req({
            offerer: req.body.email,
            grabbed: 0          });
          await reqs.save();
          console.log(reqs)
          break;               
      }
  }
  

  //Saving Req object to the db.
    //send index instead of obj id
    await f.save();
    res.status(200).send(f);
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).send({ Message: "Shift not found" });
    } else {
      console.log(e);
      res.status(400).send(e);
    }
  }
});

//POST-method
//Apply for bidding
router.post("/applyBid", async (req, res) => {
  try {
    console.log(req.body);
    const shiftId = req.body.shiftId;
    const takeremail = req.body.takeremail;
    var f = await User.findOne({ email: req.body.email });
    var sch = 0;
    for(let shift of f["shifts"]){
      // console.log(shift["_id"] == shiftId);
      if(shift["_id"] == shiftId){
          sch = {
           shiftFrom: shift["shiftFrom"],
           shiftTill: shift["shiftTill"],
           storeName: shift["storeName"],  
          };
          f["shifts"].pop(shift);
          break;               
      }
  }
  var g = await User.findOne({ email: takeremail});
  console.log(f);
  console.log(g);
  g.shifts.push(sch);
  var reqs = await Req.findOne({shiftid: shiftId});
  reqs['grabbed'] = 1;
  reqs['taker'] = takeremail;
  //Saving Req object to the db.
  await reqs.save();
    //send index instead of obj id
    await f.save();
    await g.save();
    console.log(f);
    console.log(g);
    res.status(200).send(f);
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).send({ Message: "Shift not found" });
    } else {
      console.log(e);
      res.status(400).send(e);
    }
  }
});

//POST-method
//Trade shifts with another employee
router.post("/tradeShift", async (req, res) => {
  try {
    var f = await User.findOne({ email: req.body.email1 });
    var g = await User.findOne({ email: req.body.email2 });
    var ff = f.shifts;
    var gg = g.shifts;
    if (ff[req.body.indexOfShift1].storeName != gg[req.body.indexOfShift2].storeName) {
      return res.status(400).send({Message: "Shift exchange not authorized!"});
    }

    [ff[req.body.indexOfShift1].shiftFrom, gg[req.body.indexOfShift2].shiftFrom] = [gg[req.body.indexOfShift2].shiftFrom,ff[req.body.indexOfShift1].shiftFrom];
    
    [ff[req.body.indexOfShift1].shiftTill, gg[req.body.indexOfShift2].shiftTill] = [gg[req.body.indexOfShift2].shiftTill,ff[req.body.indexOfShift1].shiftTill];
    ff[req.body.indexOfShift1].shiftToggle = 0;
    gg[req.body.indexOfShift2].shiftToggle = 0;
    //send index instead of obj id
    await f.save();
    await g.save();
    res.status(200).send({Message: "Done"});
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).send({ Message: "Shift not found" });
    } else {
      console.log(e);
      res.status(400).send(e);
    }
  }
});

//DELETE-method
//remove shift
router.delete("/removeShift", async (req, res) => {
  try {
    console.log(req.body);
    const shiftId = req.body.shiftId;
    var f = await User.findOne({ email: req.body.email });
    for(let shift of f["shifts"]){
      if(shift["_id"] == shiftId){
          f["shifts"].pop(shift);
          console.log(shift);
          break;               
      }
  }
    //send index instead of obj id
    await f.save();
    res.status(200).send(f);
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).send({ Message: "Shift not found" });
    } else {
      console.log(e);
      res.status(400).send(e);
    }
  }
});

// POST-method
// Remove an employee from the store
router.post('/removeEmployeeFromStore', adminAuth, async(req, res) =>{
  try{
      const {
          employeeEmail,
          storeName
      } = req.body
      var user = await User.findOne({ email: employeeEmail });
      if(user != null){
        for(let shift of user["shifts"]){
            if(shift["storeName"] == storeName){                
                shift["shiftToggle"] = 1;
            }
        };
        await user.save();
        var store = await Store.findOne({ storeName: storeName});
        if(store != null){
          for(let employee of store["employees"]){
            console.log(employee.employeeEmail, employeeEmail);
            if(employee["employeeEmail"]===employeeEmail)
            employee.stillWorksForStore = false;
          }
          await store.save();
          res.status(200).send({ Message: "User removed" });
        }else{
          res.status(409).send({ Message: "Store not found" });
        }
      }else{        
        res.status(409).send({ Message: "User does not work for the store" });
      }
  } catch(e) {
      if(e.code === 11000){
          res.status(409).send({ Message: "Shift not found" })
      }else{
          console.log(e)
          res.status(400).send(e)
      }
  }
})

module.exports = router;
