const express = require("express");
const path = require("path");
const familiaRoutes = require("./routes/familiaRoutes");
const apiRoutes = require("./routes/apiRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", viewRoutes);
app.use(familiaRoutes);
app.use(apiRoutes);

app.listen(PORT, () => {
  console.log(`SiàgeLab rodando em http://localhost:${PORT}`);
});
