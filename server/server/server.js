import http from "http";

const PORT = 3001;

let temperature = 65;
let rpm = 1200;

function getStatus(temp) {
  if (temp >= 80) return "CRITICAL";
  if (temp >= 70) return "WARNING";
  return "OK";
}

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/api/status") {
    // Simulated live equipment readings
    temperature =
      Math.round((temperature + (Math.random() * 6 - 3)) * 10) / 10;

    rpm = Math.round(rpm + (Math.random() * 80 - 40));

    // Keep values in realistic ranges
    temperature = Math.max(55, Math.min(90, temperature));
    rpm = Math.max(900, Math.min(1500, rpm));

    const data = {
      equipment: "Gearbox Housing",
      temperature,
      rpm,
      status: getStatus(temperature),
      timestamp: new Date().toISOString(),
    };

    res.end(JSON.stringify(data));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log("Equipment server running at http://localhost:3001");
  console.log("Live API: http://localhost:3001/api/status");
});