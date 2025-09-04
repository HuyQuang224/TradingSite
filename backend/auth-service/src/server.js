const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", routes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log("Auth service running on port", PORT));
