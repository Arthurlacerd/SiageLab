const express = require("express");
const path = require("path");
const familiaRoutes = require("./routes/familiaRoutes");
const apiRoutes = require("./routes/apiRoutes");
const viewRoutes = require("./routes/viewRoutes");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", viewRoutes);
app.use(familiaRoutes);
app.use(apiRoutes);

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`SiàgeLab rodando em http://${HOST}:${PORT}`);
  });
}

module.exports = app;
