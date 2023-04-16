const { default: mongoose } = require("mongoose");

const requestHistorySchema = new mongoose.Schema({
  by: {
    type: mongoose.Schema.Types.ObjectId,
  },
  at: {
    type: mongoose.Schema.Types.Date,
  },
  location: {
    type: Object,
  },
  status: {
    type: Number,
    default: 0, // 0 -> pending 1=> accepted, 2=> rejected by donor
  },
  isVolunteer: { type: Boolean, default: true },
});

const donationSchema = new mongoose.Schema({
  chapti_quantity: {
    type: Number,
    default: 0,
  },
  dry_bhaji: {
    type: Number,
    default: 0,
  },
  wet_bhaji: {
    type: Number,
    default: 0,
  },
  rice: {
    type: Number,
    default: 0,
  },
  best_before: {
    type: Date,
    required: true,
  },
  food_img: {
    type: String,
    required: true,
  },
  currentRequestBy: {
    type: mongoose.Schema.Types.ObjectId,
  },
  currentRequestdAt: {
    type: mongoose.Schema.Types.Date,
  },
  requestLocation: {
    type: Object,
  },
  requestHistory: [requestHistorySchema],
  status: {
    type: Number,
    required: true,
    default: 1, // 0 Withdraw donor request, 1-> Active  2-> requested 3-> fullfilled
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  donorLocation: {
    type: Object,
  },
  donatedOn: {
    type: Date,
    default: new Date(),
  },
  donorAddress: {
    type: String,
  },
  donorAcceptedAt: {
    type: Date,
  },
  isVolunteer: {
    type: Boolean,
    default: true,
  },
});

const Donation = mongoose.model("DONATION", donationSchema);

module.exports = Donation;
