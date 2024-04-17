import express from "express";
import Replicate from "replicate";
// import fs from "fs"; // i might not need this

import bodyparser from "body-parser";
import multer from "multer";

import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Configure body parser for JSON including large encoded data
// app.use(express.json({ limit: "10mb" }));
const Urlencoded = bodyparser.urlencoded({ extended: true });
// const upload = multer({ dest: "public/images" });

// Serve static files from the public directory
app.use(express.static("public"));
//stronge
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "/public/images"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname); //naming
  },
});
const upload = multer({ storage: storage });

// Serve uploaded files
// app.use("/uploads", express.static("uploads"));
app.use(Urlencoded);
const replicate = new Replicate();

app.post("/api/image", upload.single("my-file"), async (req, res) => {
  console.log("Received image for processing");
  console.log(req.file);
  try {
    const imageUrl = `https://${req.get("host")}/images/${req.file.filename}`;
    console.log(`Public URL for the uploaded image: ${imageUrl}`);

    const output = await replicate.run(
      "sujaykhandekar/object-removal:153b0087c2576ad30d8cbddb35275b387d1a6bf986bda5499948f843f6460faf",
      {
        input: {
          image_path: imageUrl,
          objects_to_remove: "person",
          // input_image: imageUrl,
          // image: imageUrl,
          // mask_prompt: "Human",
          // adjustment_factor: -25,
          // negative_mask_prompt: "Wheels",
        },
      },
    );
    console.log("Replicate API call successful. Output:", output);
    res.send({ result: output.result });

    // Clean up the temporary image file after processing
    fs.unlinkSync(filepath);
  } catch (error) {
    console.error("Error during Replicate API call:", error);
    res
      .status(500)
      .send({ error: "Failed to call Replicate API", details: error.message });
  }
});

app.get("/img/:id", (req, res) => {
  console.log(req.params.id);
  // res.sendFile(path.join(__dirname, "public/images/") + req.params.id);
  // const imageData = req.body.image.replace(/^data:image\/\w+;base64,/, "");
  // const buffer = Buffer.from(imageData, "base64");
  // const filename = `tempImage_${Date.now()}.jpg`;
  // const filepath = path.join(__dirname, "uploads", filename);
  // fs.writeFileSync(filepath, buffer);
  res.type("jpeg").send(path.join(__dirname, "public/images/") + req.params.id);
});

app.listen(3000, () => {
  console.log("Express server listening on port 3000");
});
