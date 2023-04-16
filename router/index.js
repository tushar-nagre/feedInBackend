const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Authenticate } = require("../middleware/authenticate");
const router = express.Router();
require("../db/conn");
const User = require("../model/userSchema");
const Donation = require("../model/donationsSchema");
const WalletHistory = require("../model/walletHistorySchema");
const upload = require("../middleware/fileupload");
const { getDistance } = require("../helper/distanceCal");
const { generatePassword, sendMail } = require("../helper/utlis");

router.get("/", (req, res) => {
  console.log("Fiest get API");
  res.send("Hello Its servers ROUTER First API....:}");
});

router.post("/forgotpassword", async (req, res) => {
  const targetEmail = req.body.email;

  const check = await User.findOne({ email: targetEmail });

  if (!check) {
    return res.status(400).json({
      status: false,
      message: "User with this email does not exists.",
    });
  }

  const newPassword = generatePassword();
  var mailObject = {
    from: "tnspace02@gmail.com",
    to: targetEmail,
    subject: "FeedIN Support : Your new password",
    html: `<html><body>Your new password is <b>${newPassword}</b></body></html>`,
  };

  const result = await sendMail(mailObject);
  if (!result) {
    return res.status(400).json({
      status: false,
      message: "Mail not sent.",
    });
  }
  console.log("newPassword", newPassword);
  console.log(await bcrypt.hash(newPassword, 12));
  check.password = newPassword; //await bcrypt.hash(newPassword, 12);
  console.log(check.password);
  await check.save();
  return res.status(200).json({
    status: true,
    message: "Mail sent to your email please check.",
  });
});
router.post("/logout", Authenticate(), async (req, res) => {
  res.cookie("jwtoken", null, {
    expires: new Date(Date.now() + 25892000000),
    httpOnly: true,
  });
  return res.json({ success: true });
});
router.post("/signin", async (req, res) => {
  try {
    console.log("resddd", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: false,
        message: "Please Enter Email and Password",
        error: "Please Enter Email and Password",
      });
    }

    const userLogin = await User.findOne({ email: email });

    if (!userLogin) {
      return res.status(401).json({
        status: false,
        message: "Invalid Email",
        error: "Invalid Email",
      });
    }
    const isMatch = await bcrypt.compare(password, userLogin.password);

    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: "Invalid Email or Password",
        error: "Invalid Email or Password",
      });
    }

    const token = await userLogin.generateAuthToken();
    console.log("token : ", token);
    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 25892000000),
      httpOnly: true,
    });

    return res.status(201).json({
      status: true,
      message: "Signin success.",
      data: userLogin,
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      error: "User login has some error",
    });
  }
});

router.post("/register/donor", async (req, res) => {
  try {
    const { name, email, phone, password, cpassword, address } = req.body;
    console.log(
      `API called at | ${new Date().toLocaleDateString()} | /register/donor`
    );

    const type = "donor";
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !cpassword ||
      !address ||
      !type
    ) {
      return res.status(500).json({
        status: false,
        error:
          "Please provide all the properties that are required for registration.",
      });
    }

    const userExits = await User.findOne({ email: email });

    if (userExits) {
      return res.status(422).json({
        status: false,
        error: "Email already exists.",
      });
    } else if (password !== cpassword) {
      return res.status(422).json({
        status: false,
        error: "Password and Confirm Password does not match.",
      });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      address,
      usertype: type,
    });

    await user.save();

    return res.status(201).json({
      status: true,
      message: "Registration Successful User Created.",
    });
  } catch (err) {
    console.log("User Registration has some error", err.stack);
    return res.json({
      status: false,
      error: "User Registration has some error",
    });
  }
});

router.post("/register/volunteer", async (req, res) => {
  try {
    const { name, email, phone, password, cpassword } = req.body;
    console.log(
      `API called at | ${new Date().toLocaleDateString()} | /register/volunteer`
    );

    const type = "volunteer";
    if (!name || !email || !phone || !password || !cpassword || !type) {
      console.log(name, email, phone, password, cpassword, type);
      return res.status(500).json({
        status: false,
        message:
          "Please provide all the properties that are required for registration.",
        error:
          "Please provide all the properties that are required for registration.",
      });
    }

    const userExits = await User.findOne({ email: email });

    if (userExits) {
      return res.status(422).json({
        status: false,
        message: "Email already exists.",
        error: "Email already exists.",
      });
    } else if (password !== cpassword) {
      return res.status(422).json({
        status: false,
        message: "Password and Confirm Password does not match.",
        error: "Password and Confirm Password does not match.",
      });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      cpassword,
      usertype: type,
    });

    await user.save();

    return res.status(201).json({
      status: true,
      message: "Volunteer Registration Successful User Created.",
    });
  } catch (err) {
    console.log("Volunteer Registration has some error", err.stack);
    return res.status(400).json({
      status: false,
      message: "Volunteer Registration has some error",
      error: "Volunteer Registration has some error",
    });
  }
});

router.post("/register/ngo", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      cpassword,
      address,
      organization_name,
      certificatePath,
    } = req.body;

    const type = "ngo";
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !cpassword ||
      !type ||
      !organization_name ||
      !address ||
      !certificatePath
    ) {
      return res.status(500).json({
        status: false,
        error:
          "Please provide all the properties that are required for NGO registration.",
      });
    }

    const userExits = await User.findOne({ email: email });

    if (userExits) {
      return res.status(422).json({
        status: false,
        error: "Email already exists.",
      });
    } else if (password !== cpassword) {
      return res.status(422).json({
        status: false,
        error: "Password and Confirm Password does not match.",
      });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      cpassword,
      usertype: type,
      organization_name,
      certificatePath,
    });

    await user.save();

    return res.status(201).json({
      status: true,
      message: "Volunteer Registration Successful User Created.",
    });
  } catch (err) {
    console.log("Volunteer Registration has some error", err.stack);
    return res.json({
      status: false,
      error: "Volunteer Registration has some error",
    });
  }
});

// donor
router.post("/adddonation", Authenticate(["donor"]), async (req, res) => {
  try {
    console.log(
      `API called at | ${new Date().toLocaleDateString()} | /adddonation`
    );

    const {
      food_name,
      chapti_quantity,
      dry_bhaji,
      wet_bhaji,
      rice,
      best_before,
      food_img,
      address,
      location,
    } = req.body;
    console.log("****", {
      food_name,
      chapti_quantity,
      dry_bhaji,
      wet_bhaji,
      rice,
      best_before,
      food_img,
    });
    if (!(chapti_quantity || dry_bhaji || wet_bhaji || rice)) {
      return res.status(400).json({
        status: false,
        error: "Please provide atleast one item.",
      });
    }
    if (!best_before || !address || !location) {
      return res.status(400).json({
        status: false,
        error:
          "Please provide all the properties that are required for donation.",
      });
    }
    // const userExits = await User.findOne({ email: email });

    const donation = new Donation({
      food_name: food_name || null,
      chapti_quantity: chapti_quantity || null,
      dry_bhaji: dry_bhaji || null,
      wet_bhaji: wet_bhaji || null,
      rice: rice || null,
      best_before: best_before || null,
      food_img: food_img || null,
      donorAddress: address,
      donorLocation: location,
      donorId: req.userId,
    });

    await donation.save();

    return res.status(201).json({
      status: true,
      data: {
        message: "Donation Created.",
        data: donation,
      },
    });
  } catch (err) {
    console.log("err", err);
    return res.status(400).json({
      status: false,
      error: "Donation proccess has some error",
    });
  }
});
// /donation/accept/request
router.get(
  "/donation/accept/request",
  Authenticate(["donor"]),
  async (req, res) => {
    try {
      const donations = await Donation.aggregate([
        {
          $match: {
            status: 2,
            donorId: req.userId,
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "currentRequestBy",
            foreignField: "_id",
            as: "user",
            pipeline: [
              {
                $project: { name: 1 },
              },
            ],
          },
        },
        { $unwind: "$user" },
      ]);

      return res.status(200).json({
        status: true,
        message: "Success",
        data: donations || [],
      });
    } catch (err) {
      console.log("err", err);
      return res.json({
        status: false,
        error: "GET donations API has some error",
      });
    }
  }
);
// /get/donations/history
router.get(
  "/get/donations/history",
  Authenticate(["donor"]),
  async (req, res) => {
    try {
      const donations = await Donation.find({
        status: { $ne: 0 },
        donorId: req.userId,
      }).sort({
        _id: 1,
      });

      return res.status(200).json({
        status: true,
        message: "Success",
        data: donations || [],
      });
    } catch (err) {
      return res.json({
        status: false,
        error: "GET donations API has some error",
      });
    }
  }
);

// /get/donations/history

router.post(
  "/donor/order/accept",
  Authenticate(["donor"]),
  async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await Donation.findOne({
        _id: orderId,
        status: 2,
        donorId: req.userId,
      });

      if (!order) {
        return res.status(400).json({
          status: false,
          message: "Donation not found",
          data: [],
        });
      }

      order.status = 3;
      order.donorAcceptedAt = new Date();
      order.requestHistory = order.requestHistory.map((rh) => {
        if (rh.by.toString() === order.currentRequestBy.toString()) {
          rh.status = 2;
        }
        return rh;
      });
      await order.save();
      if (order.isVolunteer) {
        await User.updateMany(
          {
            _id: { $in: [order.currentRequestBy, req.userId] },
          },
          { $inc: { walletFlems: 10, totalOrder: 1 } }
        );

        // create wallet history
        await new WalletHistory({
          userId: order.currentRequestBy,
          creditedDate: Date.now(),
          flemsCredited: 10,
          donationId: orderId,
          isDonor: false,
        }).save();

        await new WalletHistory({
          userId: req.userId,
          creditedDate: Date.now(),
          flemsCredited: 10,
          donationId: orderId,
          isDonor: true,
        }).save();
      } else {
        await User.updateOne(
          {
            _id: req.userId,
          },
          { $inc: { walletFlems: 10, totalOrder: 1 } }
        );

        await User.updateOne(
          {
            _id: order.currentRequestBy,
          },
          { $inc: { totalOrder: 1 } }
        );

        await new WalletHistory({
          userId: req.userId,
          creditedDate: Date.now(),
          flemsCredited: 10,
          donationId: orderId,
          isDonor: true,
        }).save();
      }

      return res.status(200).json({
        status: true,
        message:
          "Request accepted succesfully 10 flems credited to your wallet",
        data: order || {},
      });
    } catch (err) {
      return res.json({
        status: false,
        error: "accept donations request API has some error",
      });
    }
  }
);

router.post("/request-food", async (req, res) => {
  try {
    console.log("res", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        status: false,
        error: "Please Enter Email and Password",
      });
    }

    const userLogin = await User.findOne({ email: email });

    if (!userLogin) {
      return res.status(401).json({
        status: false,
        error: "Invalid Email",
      });
    } else {
      const token = await userLogin.generateAuthToken();
      console.log("token : ", token);
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
      });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);
    console.log("isMatch-->", isMatch);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        error: "Invalid Email or Password",
      });
    }

    return res.status(201).json({
      status: true,
      message: "Signin success.",
    });
  } catch (err) {
    return res.json({
      status: false,
      error: "User login has some error",
    });
  }
});

router.post("/get-food-request", async (req, res) => {
  try {
    console.log("******", new Date());
    const foodRequests = await Donation.find({
      isActive: false,
      donatedTo: { $ne: null },
      donatedOn: { $ne: null },
    });

    // sort the donations by lowest distance to highest distance
    console.log(donations);

    return res.status(200).json({
      status: true,
      message: "Success",
      data: donations || [],
    });
  } catch (err) {
    return res.json({
      status: false,
      error: "GET donations API has some error",
    });
  }
});

router.post("/accept-food-request", async (req, res) => {
  try {
    console.log(
      `API called at | ${new Date().toLocaleDateString()} | /accept-food-request`
    );

    console.log("/accept-food-request ***req", req);

    return res.status(200).json({
      status: true,
      message: "Request accepted successfully.",
    });
  } catch (err) {
    return res.json({
      status: false,
      error: "accept-food-request API has some error",
    });
  }
});

router.get(
  "/profile",
  Authenticate(["donor", "volunteer", "ngo"]),
  async (req, res) => {
    try {
      const { userId } = req;
      const user = await User.aggregate([
        { $match: { _id: userId } },
        { $project: { password: 0, cpassword: 0 } },
        {
          $lookup: {
            from: "wallethistories",
            localField: "_id",
            foreignField: "userId",
            as: "walletHistory",
          },
        },
      ]);
      if (user.length === 0) {
        return res.status(404).send("User not found");
      }
      return res.status(200).json({
        status: true,
        message: "Success",
        data: user[0] || {},
      });
    } catch (err) {
      return res.json({
        status: false,
        error: "GET user Profile API has some error",
      });
    }
  }
);

router.post("/upload", Authenticate(["donor"]), async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log("err", err);
      return res.sendStatus(500);
    }
    return res.status(200).json({
      status: true,
      message: "Success",
      data: req.file,
    });
  });
});

router.get(
  "/active/request",
  Authenticate(["volunteer", "ngo"]),
  async (req, res) => {
    try {
      const { location } = req.headers;
      console.log(location);
      const userLocation = JSON.parse(location);

      let request = await Donation.aggregate([
        {
          $match: {
            $or: [
              { status: 1 },
              {
                currentRequestBy: req.userId,
                best_before: { $gte: new Date() },
              },
            ],
          },
        },
        {
          $project: {
            chapti_quantity: 1,
            dry_bhaji: 1,
            wet_bhaji: 1,
            rice: 1,
            best_before: 1,
            food_img: 1,
            donorLocation: 1,
            donatedOn: 1,
            donorAddress: 1,
            donorId: 1,
            status: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "donorId",
            foreignField: "_id",
            as: "donor",
            pipeline: [
              {
                $project: { name: 1, email: 1, phone: 1 },
              },
            ],
          },
        },
        { $unwind: "$donor" },
      ]);
      request = request.map((re) => {
        re.distance = getDistance(userLocation, re.donorLocation);
        return re;
      });
      return res.status(200).json({
        status: true,
        message: "Success",
        data: request || {},
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: false,
        error: "GET user Profile API has some error",
      });
    }
  }
);

router.get("/history", Authenticate(["volunteer", "ngo"]), async (req, res) => {
  try {
    let request = await Donation.aggregate([
      { $match: { currentRequestBy: req.userId, status: 3 } },
      {
        $project: {
          chapti_quantity: 1,
          dry_bhaji: 1,
          wet_bhaji: 1,
          rice: 1,
          best_before: 1,
          food_img: 1,
          donorLocation: 1,
          donatedOn: 1,
          donorAddress: 1,
          donorId: 1,
          status: 1,
          donorAcceptedAt: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "donorId",
          foreignField: "_id",
          as: "donor",
          pipeline: [
            {
              $project: { name: 1 },
            },
          ],
        },
      },
      { $unwind: "$donor" },
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      data: request || [],
    });
  } catch (err) {
    console.log(err);
    return res.json({
      status: false,
      error: "GET user Profile API has some error",
    });
  }
});

router.post(
  "/request/place",
  Authenticate(["volunteer", "ngo"]),
  async (req, res) => {
    try {
      const { orderId, location } = req.body;

      let request = await Donation.findOne({
        _id: orderId,
        status: 1,
        best_before: { $gte: new Date() },
      });
      if (!request) {
        return res.status(400).send("Order not found");
      }
      request.status = 2;
      request.currentRequestBy = req.userId;
      request.currentRequestdAt = new Date();
      request.requestLocation = location;
      request.isVolunteer = req.role === "volunteer";
      const obj = {
        by: req.userId,
        at: new Date(),
        location,
        status: 0,
        isVolunteer: request.isVolunteer,
      };
      if (request.requestHistory) request.requestHistory.push(obj);
      else {
        request.requestHistory = [];
        request.requestHistory.push(obj);
      }
      await request.save();
      return res.status(200).json({
        status: true,
        message: "Success",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        status: false,
        error: "GET user Profile API has some error",
      });
    }
  }
);

router.post("/upload/re", async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.log("err", err);
      return res.sendStatus(500);
    }
    return res.status(200).json({
      status: true,
      message: "Success",
      data: req.file,
    });
  });
});
module.exports = router;
