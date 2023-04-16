const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      // enum: ["Point"], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
    },
  },
  organization_name: {
    type: String,
  },
  usertype: {
    type: String,
    required: true,
  },
  walletFlems: {
    type: Number,
    default: 0,
  },
  totalOrder: {
    type: Number,
  },
  certificatePath: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.SECRETE_KEY);
    // this.tokens = this.tokens.concat({ token: token });
    // await this.save();
    return token;
  } catch (err) {
    console.log("Error in generating token", err);
  }
};

const User = mongoose.model("users", userSchema);

module.exports = User;
