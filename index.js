import express from "express";
import Replicate from "replicate";
// import fs from "fs"; // i might not need this

import bodyparser from "body-parser";
import multer from "multer";
import http from "http";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server);
// Configure body parser for JSON including large encoded data
// app.use(express.json({ limit: "10mb" }));
const Urlencoded = bodyparser.urlencoded({ extended: true });
// const upload = multer({ dest: "public/images" });


io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit('instruction', { message: 'Trigger capture on front-end.' });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});



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

app.post("/button/pressed/high", (req, res) => {
    // 这里处理按钮按下的逻辑，例如触发图片捕捉或其他
    console.log("Button press signal received.");
    // 响应给app.py
    io.emit('buttonPressed', { message: 'The button was pressed' });
    // 响应给发起请求的客户端
   
    res.status(200).json({ message: "Button press received" });
});



app.post("/api/image", upload.single("my-file"), async (req, res) => {
  console.log("Received image for processing");
  console.log(req.file);
  try {
    const imageUrl = `https://${req.get("host")}/images/${req.file.filename}`;
    console.log(`Public URL for the uploaded image: ${imageUrl}`);

    const output = await replicate.run(
      "daanelson/plug_and_play_image_translation:ae10351e6de912fa681854e472bb7aff011411f2c3802b2ccd836a2a22408069",
      {
        input: {
          input_image: imageUrl,
          negative_prompt: "a photo of a human",
          translation_prompts: "a photo of a flowers",
        },
      },
    );
    console.log("Replicate API call successful. Output:", output);
    res.send({ result: output.result });
    return;
    // Clean up the temporary image file after processing
    // fs.unlinkSync(filepath);
  } catch (error) {
    console.error("Error during Replicate API call:", error);
    if (res.headersSent) {
      // Log the error or handle it, but don't attempt to send another response
      return;
    }
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
