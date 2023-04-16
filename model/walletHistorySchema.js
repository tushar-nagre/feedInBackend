const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const walletHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  creditedDate: {
    type: Date,
    required: true,
    default: new Date(),
  },
  flemsCredited: {
    type: Number,
    required: true,
  },
  donationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DONATION",
  },
  isDonor: {
    type: Boolean,
    default: true,
  },
});

const WalletHistory = mongoose.model("walletHistory", walletHistorySchema);

module.exports = WalletHistory;
