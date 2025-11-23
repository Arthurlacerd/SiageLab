const express = require("express");
const { postDiagnostico } = require("../controllers/diagnosticoController");
const { postCronograma } = require("../controllers/cronogramaController");

const router = express.Router();

router.post("/api/diagnostico", postDiagnostico);
router.post("/api/cronograma", postCronograma);
router.post("/cronograma", postCronograma);

module.exports = router;
