const express = require("express");
const {
  listarFamilias,
  obterFamilia,
} = require("../controllers/familiaController");

const router = express.Router();

router.get("/familias", listarFamilias);
router.get("/familias/:id", obterFamilia);
router.get("/api/familias", listarFamilias);
router.get("/api/familias/:id", obterFamilia);

module.exports = router;
