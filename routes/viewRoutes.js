const express = require("express");
const path = require("path");

const router = express.Router();
const viewsPath = path.join(__dirname, "..", "views");

router.get("/", (req, res) => {
  res.sendFile(path.join(viewsPath, "index.html"));
});

router.get("/diagnostico", (req, res) => {
  res.redirect("/#diagnostico");
});

router.get("/resultado", (req, res) => {
  res.redirect("/#resultado");
});

module.exports = router;
