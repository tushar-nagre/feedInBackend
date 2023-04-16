const { default: mongoose } = require("mongoose");

const foodRequestSchema = new mongoose.Schema({
  requester_name: {
    type: String,
    required: true,
  },
  donor_name: {
    type: String,
    required: true,
  },
  donation_id: {
    type: String,
    required: true,
  },
  requested_On: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: Number,
    required: true,
    default: 1, // 0 Withdraw donor request, 1-> Active request 2-> Accept
  },
});

const Donation = mongoose.model("FOODREQUESTS", foodRequestSchema);

module.exports = Donation;
