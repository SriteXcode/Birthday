import fs from "fs";
import path from "path";

const workspaceRoot = path.resolve();
const contentJsonPath = path.join(workspaceRoot, "src", "data", "content.json");
const publicImagesDir = path.join(workspaceRoot, "public", "images");

function run() {
  if (!fs.existsSync(contentJsonPath)) {
    console.error(`Error: content.json not found at ${contentJsonPath}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(contentJsonPath, "utf-8"));
  const gallery = content.gallery || [];

  let updatedCount = 0;

  // Finalize standard gallery images
  gallery.forEach((item) => {
    const relativeUrl = item.url;
    if (relativeUrl.startsWith("http")) return;

    const filename = path.basename(relativeUrl);
    const publicId = path.parse(filename).name;
    const jsonPath = path.join(publicImagesDir, `${publicId}.json`);

    if (fs.existsSync(jsonPath)) {
      try {
        let fileContent = fs.readFileSync(jsonPath, "utf-8");
        
        // Check for PowerShell UTF-16 LE encoding signature (BOM or null-bytes)
        if (fileContent.includes("\u0000") || fileContent.startsWith("\uFFFD")) {
          fileContent = fs.readFileSync(jsonPath, "utf16le");
        }
        
        // Strip BOM if present
        if (fileContent.charCodeAt(0) === 0xFEFF) {
          fileContent = fileContent.substring(1);
        }

        const resData = JSON.parse(fileContent.trim());
        if (resData.secure_url) {
          item.url = resData.secure_url;
          updatedCount++;
        }
        // Cleanup temp file
        fs.unlinkSync(jsonPath);
      } catch (err) {
        console.error(`Failed to parse temp file for ${filename}: ${err.message}`);
      }
    }
  });

  // Finalize upcoming images if folder exists
  const upcomingDir = path.join(publicImagesDir, "upcoming");
  if (fs.existsSync(upcomingDir)) {
    const tempJsonFiles = fs.readdirSync(upcomingDir).filter(file => path.extname(file).toLowerCase() === ".json");
    tempJsonFiles.forEach((file) => {
      const jsonPath = path.join(upcomingDir, file);
      try {
        fs.unlinkSync(jsonPath); // Just cleanup since these are not referenced in content.json
      } catch (err) {}
    });
  }

  // Write updated content.json back
  fs.writeFileSync(contentJsonPath, JSON.stringify(content, null, 2), "utf-8");
  console.log(`\nSuccess! Updated ${updatedCount} gallery image links to secure Cloudinary URLs.`);
}

run();
