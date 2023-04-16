const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const Authenticate = (role) => {
  return async (req, res, next) => {
    try {
      const token = req.cookies.jwtoken;
      const verifyToken = jwt.verify(token, process.env.SECRETE_KEY);
      let rootUser = null;
      if (role) {
        rootUser = await User.findOne({
          _id: verifyToken._id,
          usertype: { $in: role },
        });
      } else {
        rootUser = await User.findOne({
          _id: verifyToken._id,
        });
      }
      if (!rootUser) {
        throw new Error("Authorized user not found");
      }

      req.token = token;
      req.rootUser = rootUser;
      req.userId = rootUser._id;
      req.role = rootUser.usertype;

      return next();
    } catch (err) {
      console.log("Unauthorized: No token provided", err);
      return res.status(401).send("Unauthorized: No token provided");
    }
  };
};

module.exports = { Authenticate };
