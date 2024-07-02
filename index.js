require("dotenv").config();
const express = require("express");
const app = express();
const axios = require("axios");
const ip = require("ip");

const PORT = process.env.PORT || 3000;

// Middleware to get the IP address of the request
app.use((req, res, next) => {
  req.clientIp =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.ip ||
    ip.address();
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({ status: 200, message: "Welcome to my API" });
});
app.get("/api/hello", async (req, res) => {
  const { visitor_name } = req.query;
  const clientIp = "64.226.76.244";

  try {
    console.log(clientIp, process.env.OPENWEATHER_API_KEY);
    if (!visitor_name) throw new Error("Please provide a visitor name");
    const getLocation = await axios.get(`https://ipapi.co/${clientIp}/json/`);

    const city = getLocation.data.city;
    const latitude = getLocation.data.latitude;
    const longitude = getLocation.data.longitude;

    const getWeather = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    // const temperature = Number(getWeather.data.main.temp - 273.15).toFixed(2);
    const temperature = getWeather.data.main.temp;

    res.status(200).json({
      client_ip: clientIp,
      location: city,
      greeting: `Hello ${visitor_name}!, the temperature is ${
        temperature || "unknown"
      } degrees Celsius in ${city}`,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: 400, message: error.message || "An error occured" });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
