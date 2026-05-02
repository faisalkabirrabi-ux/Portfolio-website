import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const CONTENT_PATH = path.join(process.cwd(), "src", "content.json");
  const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
  const fs = await import("fs/promises");
  const multer = (await import("multer")).default;

  // Ensure uploads directory exists
  try {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  } catch (err) {
    console.error("Failed to create uploads directory", err);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ storage });

  // Upload endpoint
  app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
  });

  // Get Content
  app.get("/api/content", async (req, res) => {
    try {
      const data = await fs.readFile(CONTENT_PATH, "utf-8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read content" });
    }
  });

  // Save Content
  app.post("/api/content", async (req, res) => {
    try {
      await fs.writeFile(CONTENT_PATH, JSON.stringify(req.body, null, 2));
      res.json({ message: "Content saved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save content" });
    }
  });

  // API Route for Contact Form with Server-Side Validation
  app.post("/api/contact", (req, res) => {
    const { name, email, message } = req.body;

    const errors: Record<string, string> = {};

    // Name Validation
    if (!name || name.trim().length < 2) {
      errors.name = "Identification required / Name too short.";
    } else if (name.length > 100) {
      errors.name = "Identification exceeded limit / Name too long.";
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = "Return signal invalid / Email format required.";
    }

    // Message Validation
    if (!message || message.trim().length < 10) {
      errors.message = "Transmission data insufficient / Message too short.";
    } else if (message.length > 5000) {
      errors.message = "Transmission buffer overflow / Message too long.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        status: "error", 
        message: "Signal rejected / Validation failed.", 
        errors 
      });
    }

    // Success logic (in a real app, you might save to DB or send an email here)
    console.log("Contact submission received:", { name, email, message });

    res.json({ 
      status: "success", 
      message: "Transmission received / Data archived." 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
