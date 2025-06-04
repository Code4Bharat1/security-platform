import express from "express";
import axios from "axios";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(helmet());
app.use(apiLimiter);
app.use(express.json());

const testAPI = async (url, method, headers, body, options = {}) => {
  try {
    const response = await axios({
      url,
      method,
      headers,
      data: body,
      ...options,
    });
    return { data: response.data, status: response.status };
  } catch (error) {
    console.error(`Error calling API: ${error.message}`);
    return { error: error.message };
  }
};

app.post("/api/test", async (req, res) => {
  const { url, method, headers, body } = req.body;

  if (!url || !method) {
    return res.status(400).json({ error: "URL and method are required" });
  }

  const result = await testAPI(url, method, headers, body);

  if (result.error) {
    return res.status(500).json({ error: result.error });
  }

  res.status(result.status).json(result.data);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
