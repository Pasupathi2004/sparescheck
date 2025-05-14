const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Add dotenv for environment variables

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection using environment variable for security
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

// Mongoose schema and model
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rack: { type: String, required: true },
  bin: { type: String, required: true },
  quantity: { type: Number, required: true },
  updated: { type: String, required: true },
});
const Item = mongoose.model("Item", ItemSchema);

// ➕ Add item
app.post("/add", async (req, res) => {
  const { name, rack, bin, quantity } = req.body;
  if (!name || !rack || !bin || quantity == null) {
    return res.status(400).json({ error: "❌ All fields are required!" });
  }
  if (quantity < 0) {
    return res.status(400).json({ error: "❌ Quantity cannot be negative!" });
  }

  try {
    const updated = new Date().toLocaleString();
    const item = new Item({ name, rack, bin, quantity, updated });
    await item.save();
    res.json({ message: "✅ Item added!" });
  } catch (err) {
    res.status(500).json({ error: `❌ Failed to add item: ${err.message}` });
  }
});

// 🔍 Search item by name
app.get("/search", async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).json({ error: "❌ Item name is required!" });
  }

  try {
    const item = await Item.findOne({ name });
    if (item) res.json(item);
    else res.status(404).json({ error: "❌ Item not found!" });
  } catch (err) {
    res.status(500).json({ error: `❌ Error while searching: ${err.message}` });
  }
});

// 📦 Show all items
app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: `❌ Error fetching items: ${err.message}` });
  }
});

// 🛠️ Get all spares (same as items for now)
app.get("/spares", async (req, res) => {
  try {
    const spares = await Item.find();
    res.json(spares);
  } catch (err) {
    res.status(500).json({ error: `❌ Error fetching spares: ${err.message}` });
  }
});

// 🔄 Update quantity
app.put("/update", async (req, res) => {
  const { name, quantity } = req.body;
  if (!name || quantity == null) {
    return res.status(400).json({
      error: "❌ Item name and quantity are required!",
    });
  }
  if (quantity < 0) {
    return res.status(400).json({ error: "❌ Quantity cannot be negative!" });
  }

  try {
    const updated = new Date().toLocaleString();
    const item = await Item.findOneAndUpdate(
      { name },
      { $set: { quantity, updated } },
      { new: true }
    );
    if (item) res.json({ message: "✅ Quantity updated!", item });
    else res.status(404).json({ error: "❌ Item not found!" });
  } catch (err) {
    res.status(500).json({ error: `❌ Error updating item: ${err.message}` });
  }
});

// ❌ Delete item
app.delete("/delete", async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "❌ Item name is required!" });
  }

  try {
    const result = await Item.deleteOne({ name });
    if (result.deletedCount > 0)
      res.json({ message: "🗑️ Item deleted successfully!" });
    else res.status(404).json({ error: "❌ Item not found!" });
  } catch (err) {
    res.status(500).json({ error: `❌ Error deleting item: ${err.message}` });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
