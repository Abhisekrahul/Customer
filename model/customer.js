const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  city: { type: String, required: true },
  company: { type: String, required: true },
});

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
