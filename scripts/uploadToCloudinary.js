import fs from "fs";
import path from "path";
import crypto from "crypto";

const workspaceRoot = path.resolve();
const envPath = path.join(workspaceRoot, ".env");
const contentJsonPath = path.join(workspaceRoot, "src", "data", "content.json");
const publicImagesDir = path.join(workspaceRoot, "public", "images");

// Parse .env manually to avoid extra dependencies
function parseEnv() {
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      env[key.trim()] = value.trim();
    }
  });
  return env;
}

async function run() {
  const env = parseEnv();
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = env.VITE_CLOUDINARY_API_SECRET;

  if (
    !cloudName ||
    !apiKey ||
    !apiSecret ||
    cloudName === "your_cloud_name" ||
    apiKey === "your_api_key" ||
    apiSecret === "your_api_secret"
  ) {
    console.error("\x1b[31mError: Cloudinary credentials are not configured in your .env file.\x1b[0m");
    console.log("Please update the following variables in your .env file:");
    console.log("  VITE_CLOUDINARY_CLOUD_NAME");
    console.log("  VITE_CLOUDINARY_API_KEY");
    console.log("  VITE_CLOUDINARY_API_SECRET");
    process.exit(1);
  }

  if (!fs.existsSync(contentJsonPath)) {
    console.error(`Error: content.json not found at ${contentJsonPath}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(contentJsonPath, "utf-8"));
  const gallery = content.gallery || [];

  console.log(`Starting Cloudinary upload for ${gallery.length} gallery images...`);

  let successCount = 0;

  for (let i = 0; i < gallery.length; i++) {
    const item = gallery[i];
    const relativeUrl = item.url;

    // Check if it's already a Cloudinary or remote URL
    if (relativeUrl.startsWith("http")) {
      console.log(`[${i + 1}/${gallery.length}] Skipping (already remote): ${relativeUrl}`);
      successCount++;
      continue;
    }

    const filename = path.basename(relativeUrl);
    const localImagePath = path.join(publicImagesDir, filename);

    if (!fs.existsSync(localImagePath)) {
      console.warn(`[${i + 1}/${gallery.length}] Warning: Local file not found: ${localImagePath}`);
      continue;
    }

    // Upload to Cloudinary using Node fetch
    const publicId = path.parse(filename).name;
    const folder = "sweatuuu";
    const publicIdWithFolder = `${folder}/${publicId}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signatureString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(localImagePath);
    const fileBlob = new Blob([fileBuffer]);

    formData.append("file", fileBlob, filename);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);
    formData.append("public_id", publicId);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    try {
      console.log(`[${i + 1}/${gallery.length}] Uploading ${filename} to Cloudinary...`);
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Upload failed");
      }

      const result = await response.json();
      item.url = result.secure_url;
      successCount++;
      console.log(`  \x1b[32mSuccess!\x1b[0m Cloudinary URL: ${result.secure_url}`);
    } catch (error) {
      console.error(`  \x1b[31mFailed to upload ${filename}: ${error.message}\x1b[0m`);
    }
  }

  // Check for upcoming folder
  const upcomingDir = path.join(publicImagesDir, "upcoming");
  if (fs.existsSync(upcomingDir)) {
    const upcomingFiles = fs.readdirSync(upcomingDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp" || ext === ".gif";
    });
    
    console.log(`\nChecking upcoming folder at ${upcomingDir}... Found ${upcomingFiles.length} images.`);
    
    for (let i = 0; i < upcomingFiles.length; i++) {
      const filename = upcomingFiles[i];
      const localImagePath = path.join(upcomingDir, filename);
      const publicId = path.parse(filename).name;
      const folder = "sweatuuu/upcoming";
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signatureString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureString).digest("hex");
      
      const formData = new FormData();
      const fileBuffer = fs.readFileSync(localImagePath);
      const fileBlob = new Blob([fileBuffer]);
      
      formData.append("file", fileBlob, filename);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      formData.append("folder", folder);
      formData.append("public_id", publicId);
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      
      try {
        console.log(`[${i + 1}/${upcomingFiles.length}] Uploading upcoming/${filename} to Cloudinary...`);
        const response = await fetch(uploadUrl, { method: "POST", body: formData });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Upload failed");
        }
        const result = await response.json();
        console.log(`  \x1b[32mSuccess!\x1b[0m Cloudinary URL: ${result.secure_url}`);
      } catch (error) {
        console.error(`  \x1b[31mFailed to upload upcoming/${filename}: ${error.message}\x1b[0m`);
      }
    }
  }

  // Write updated content.json back
  fs.writeFileSync(contentJsonPath, JSON.stringify(content, null, 2), "utf-8");
  console.log(`\n\x1b[32mCompleted! Successfully uploaded ${successCount}/${gallery.length} images to Cloudinary.\x1b[0m`);
  console.log(`Updated configuration saved in src/data/content.json.`);
}

run();
