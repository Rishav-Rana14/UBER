const { validationResult } = require("express-validator");
const captionModel = require("../models/captain.model.js");
const captainService = require("../services/captain.service.js");
const captainModel = require("../models/captain.model.js");

module.exports.registerCaptain = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors
          .array()
          .map((error) => error.msg)
          .join("; "),
      });
    }
    const { email, fullname, password, vehicle } = req.body;

    const isCaptainAlready = await captainModel.findOne({ email });
    
    if (isCaptainAlready) {
      return res.status(400).json({ message: "Captain already exist" });
    }
    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      email,
      password: hashedPassword,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });
    const token = captain.generateAuthToken();
    res.status(201).json({ token, captain });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
