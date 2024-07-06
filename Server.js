const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Customer = require("./model/customer");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
mongoose
  .connect("mongodb://0.0.0.0:27017/customer_db ")
  .then(() => console.log("data baseConnected!"));

// API to list customers with search and pagination
app.get("/customers", async (req, res) => {
  try {
    const { first_name, last_name, city, page = 1, limit = 10 } = req.query;

    const query = {};
    if (first_name) query.first_name = new RegExp(first_name, "i");
    if (last_name) query.last_name = new RegExp(last_name, "i");
    if (city) query.city = new RegExp(city, "i");

    const customers = await Customer.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Customer.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      customers,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API to get single customer by ID
app.get("/customers/:id", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).send("Customer not found");
    }
    res.json(customer);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API to list unique cities with customer count
app.get("/cities", async (req, res) => {
  try {
    const cities = await Customer.aggregate([
      {
        $group: {
          _id: "$city",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(cities);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// API to add a new customer with validation
app.post("/customers", async (req, res) => {
  const { first_name, last_name, city, company } = req.body;

  if (!first_name || !last_name || !city || !company) {
    return res.status(400).send("All fields are required");
  }

  try {
    const existingCities = await Customer.distinct("city");
    const existingCompanies = await Customer.distinct("company");

    if (
      !existingCities.includes(city) ||
      !existingCompanies.includes(company)
    ) {
      return res.status(400).send("City or company does not exist");
    }

    const newCustomer = new Customer({
      first_name,
      last_name,
      city,
      company,
    });

    await newCustomer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
