import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route for Cloudinary Config (Only for authorized admin)
  app.get("/api/config", (req, res) => {
    // We don't send the preset to the client, we handle upload in backend or 
    // just confirm if config exists
    res.json({ 
      hasCloudinary: !!process.env.VITE_CLOUDINARY_CLOUD_NAME,
      whatsappNumber: process.env.VITE_WHATSAPP_NUMBER
    });
  });

  // Secure Image Upload Proxy to Cloudinary
  app.post("/api/upload", async (req, res) => {
    const { image, password } = req.body;

    if (password !== process.env.VITE_ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Cloudinary upload logic...
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', process.env.VITE_CLOUDINARY_UPLOAD_PRESET!);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      res.json({ url: data.secure_url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // NEW: Secure GitHub Sync Endpoint
  app.post("/api/sync-github", async (req, res) => {
    const { products, password } = req.body;
    const token = process.env.VITE_GITHUB_TOKEN;
    const repo = process.env.VITE_GITHUB_REPO; // e.g. "username/repo-name"
    
    if (password !== process.env.VITE_ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!token || !repo) {
      return res.status(400).json({ error: "GitHub not configured in backend" });
    }

    try {
      const path = 'public/products.json';
      const url = `https://api.github.com/repos/${repo}/contents/${path}`;
      
      // 1. Get the current file SHA (required to update)
      const getRes = await fetch(url, {
        headers: { 'Authorization': `token ${token}` }
      });
      const fileData = await getRes.json();
      const sha = fileData.sha;

      // 2. Update the file
      const putRes = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update products.json via Admin Panel',
          content: Buffer.from(JSON.stringify(products, null, 2)).toString('base64'),
          sha: sha
        })
      });

      if (!putRes.ok) throw new Error('GitHub update failed');
      
      res.json({ success: true });
    } catch (error) {
      console.error("GitHub Error:", error);
      res.status(500).json({ error: "Failed to sync with GitHub" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
