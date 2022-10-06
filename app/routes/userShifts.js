const express = require("express");
const router = express.Router();
const User = require("../models/user");
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
    const shiftFrom = Date.parse(req.body.shiftFrom);
    const shiftTill = Date.parse(req.body.shiftTill);
    const storeName = req.body.storeName;
    const sch = {
      shiftFrom: shiftFrom,
      shiftTill: shiftTill,
      storeName: storeName,
    };
    // console.log(sch);

    if (!shiftFrom || !shiftTill) {
      return res.status(400).send("Time not in required format!");
    }
    // Send response in here
    var f = await User.findOne({ email: req.body.email });
    f.shifts.push(sch);
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

//POST-method
//Offer Shift to Bidders or Traders
router.post("/offershift", async (req, res) => {
  try {
    console.log(req.body);
    var f = await User.findOne({ email: req.body.email });
    var ff = f.shifts;
    ff[req.body.id].shiftToggle = 1;
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
router.post("/applybid", async (req, res) => {
  try {
    console.log(req.body);
    var f = await User.findOne({ email: req.body.email });
    var ff = f.shifts;
    ff[req.body.id].bidderList.push(req.body.userid);
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
//Trade shifts with another employee
router.post("/tradeshift", async (req, res) => {
  try {
    var f = await User.findOne({ email: req.body.email1 });
    var g = await User.findOne({ email: req.body.email2 });
    var ff = f.shifts;
    var gg = g.shifts;
    if (ff[req.body.id1].storeName != gg[req.body.id2].storeName) {
      return res.status(400).send("Shift exchange not authorized!");
    }
    [ff[req.body.id1].shiftFrom, gg[req.body.id2].shiftFrom] = [gg[req.body.id2].shiftFrom,ff[req.body.id1].shiftFrom];
    
    [ff[req.body.id1].shiftTill, gg[req.body.id2].shiftTill] = [gg[req.body.id2].shiftTill,ff[req.body.id1].shiftTill];
    ff[req.body.id1].shiftToggle = 0;
    gg[req.body.id2].shiftToggle = 0;
    //send index instead of obj id
    await f.save();
    await g.save();
    res.status(200).send("done");
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).send({ Message: "Shift not found" });
    } else {
      console.log(e);
      res.status(400).send(e);
    }
  }
});

module.exports = router;