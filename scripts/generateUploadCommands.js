import fs from "fs";
import path from "path";
import crypto from "crypto";

const workspaceRoot = path.resolve();
const envPath = path.join(workspaceRoot, ".env");
const contentJsonPath = path.join(workspaceRoot, "src", "data", "content.json");
const publicImagesDir = path.join(workspaceRoot, "public", "images");
const runUploadPs1Path = path.join(workspaceRoot, "scripts", "runUpload.ps1");

// Parse .env manually
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

function run() {
  const env = parseEnv();
  const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = env.VITE_CLOUDINARY_API_KEY;
  const apiSecret = env.VITE_CLOUDINARY_API_SECRET;
  const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const isUnsigned = uploadPreset && uploadPreset !== "your_upload_preset";

  if (!cloudName || cloudName === "your_cloud_name") {
    console.error("Error: VITE_CLOUDINARY_CLOUD_NAME is not configured in your .env file.");
    process.exit(1);
  }

  if (!isUnsigned && (!apiKey || !apiSecret || apiKey === "your_api_key" || apiSecret === "your_api_secret")) {
    console.error("Error: Signed upload requires VITE_CLOUDINARY_API_KEY and VITE_CLOUDINARY_API_SECRET inside .env.");
    process.exit(1);
  }

  if (!fs.existsSync(contentJsonPath)) {
    console.error(`Error: content.json not found at ${contentJsonPath}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(contentJsonPath, "utf-8"));
  const gallery = content.gallery || [];
  
  const psLines = [];
  psLines.push(`Write-Host "Starting Cloudinary uploads via curl (${isUnsigned ? 'Unsigned' : 'Signed'} mode)..."`);

  let uploadTasksCount = 0;

  // Process standard gallery images
  gallery.forEach((item) => {
    const relativeUrl = item.url;
    if (relativeUrl.startsWith("http")) return;

    const filename = path.basename(relativeUrl);
    const localImagePath = path.join(publicImagesDir, filename);

    if (!fs.existsSync(localImagePath)) return;

    const publicId = path.parse(filename).name;
    const folder = "sweatuuu";
    const relativeLocalPath = `public/images/${filename}`;
    const outputJsonPath = `public/images/${publicId}.json`;

    psLines.push(`Write-Host "Uploading ${filename}..."`);

    if (isUnsigned) {
      // Unsigned upload curl
      psLines.push(`curl.exe -s -F "file=@${relativeLocalPath}" -F "upload_preset=${uploadPreset}" -F "folder=${folder}" -F "public_id=${publicId}" "https://api.cloudinary.com/v1_1/${cloudName}/image/upload" > "${outputJsonPath}"`);
    } else {
      // Signed upload curl
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signatureString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(signatureString).digest("hex");
      psLines.push(`curl.exe -s -F "file=@${relativeLocalPath}" -F "api_key=${apiKey}" -F "timestamp=${timestamp}" -F "signature=${signature}" -F "folder=${folder}" -F "public_id=${publicId}" "https://api.cloudinary.com/v1_1/${cloudName}/image/upload" > "${outputJsonPath}"`);
    }
    
    uploadTasksCount++;
  });

  // Process upcoming images if folder exists
  const upcomingDir = path.join(publicImagesDir, "upcoming");
  if (fs.existsSync(upcomingDir)) {
    const upcomingFiles = fs.readdirSync(upcomingDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".webp" || ext === ".gif";
    });

    upcomingFiles.forEach((filename) => {
      const publicId = path.parse(filename).name;
      const folder = "sweatuuu/upcoming";
      const relativeLocalPath = `public/images/upcoming/${filename}`;
      const outputJsonPath = `public/images/upcoming/${publicId}.json`;

      psLines.push(`Write-Host "Uploading upcoming/${filename}..."`);

      if (isUnsigned) {
        psLines.push(`curl.exe -s -F "file=@${relativeLocalPath}" -F "upload_preset=${uploadPreset}" -F "folder=${folder}" -F "public_id=${publicId}" "https://api.cloudinary.com/v1_1/${cloudName}/image/upload" > "${outputJsonPath}"`);
      } else {
        const timestamp = Math.round(new Date().getTime() / 1000) + 1;
        const signatureString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(signatureString).digest("hex");
        psLines.push(`curl.exe -s -F "file=@${relativeLocalPath}" -F "api_key=${apiKey}" -F "timestamp=${timestamp}" -F "signature=${signature}" -F "folder=${folder}" -F "public_id=${publicId}" "https://api.cloudinary.com/v1_1/${cloudName}/image/upload" > "${outputJsonPath}"`);
      }
      
      uploadTasksCount++;
    });
  }

  psLines.push(`Write-Host "All uploads finished."`);

  fs.writeFileSync(runUploadPs1Path, psLines.join("\r\n"), "utf-8");
  console.log(`Successfully generated ${uploadTasksCount} upload commands in ${runUploadPs1Path} using ${isUnsigned ? 'Unsigned' : 'Signed'} mode`);
}

run();
