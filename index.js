import express from "express";
import Replicate from "replicate";
// import fs from "fs"; // i might not need this
import https from "https";
import bodyparser from "body-parser";
import multer from "multer";
import fs from "fs";

import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const Urlencoded = bodyparser.urlencoded({ extended: true });

// Serve static files from the public directory
app.use(express.static("public"));
app.use("/storage", express.static(path.join("public/storage")));
app.use("/camera", express.static(path.join("public/camera")));

function downloadAndSaveImage(url, folder) {
  // 确保目标文件夹存在
  const dir = path.join(__dirname, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 使用日期时间来生成独特的文件名
  const timestamp = new Date().toISOString().replace(/[:\-\.]/g, "");
  const extension = path.extname(url); // 从URL中获取文件扩展名
  const filename = `image_${timestamp}${extension}`; // 构造文件名
  const filepath = path.join(dir, filename); // 完整的文件路径

  // 创建写入流
  const file = fs.createWriteStream(filepath);

  https
    .get(url, (response) => {
      response.pipe(file); // 将HTTP响应直接写入文件

      file.on("finish", () => {
        file.close(); // 关闭文件流
        console.log("Download and save completed:", filepath);
      });
    })
    .on("error", (err) => {
      fs.unlink(filepath, () => {}); // 如果出现错误，删除创建的文件
      console.error("Error downloading the image:", err.message);
    });
}

const imagesDir = path.join(__dirname, "public/images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

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

    const output1 = await replicate.run(
      "sujaykhandekar/object-removal:153b0087c2576ad30d8cbddb35275b387d1a6bf986bda5499948f843f6460faf",
      {
        input: {
          image_path: imageUrl,
          // objects_to_remove: "person",
          // input_image: imageUrl,
          // image: imageUrl1,
          // // prompt: "human",
          // mask_prompt: "Human",
          // adjustment_factor: -15,
          // negative_mask_prompt: "Cloth",
          // model_image: imageUrl1,
          objects_to_remove: "person",
          // mask_only: true,
          // mask_limit: 1,
          // crop_n_layers: 0,
          // box_nms_thresh: 0.7,
          // crop_nms_thresh: 0.7,
          // points_per_side: 32,
          // pred_iou_thresh: 0.88,
          // crop_overlap_ratio: 0.3413333333333333,
          // min_mask_region_area: 0,
          // stability_score_offset: 1,
          // stability_score_thresh: 0.95,
          // crop_n_points_downscale_factor: 1
        },
      },
    );

    console.log("Replicate API call successful. Output1:", output1);
    // downloadAndSaveImage(output1, "result");
    // res.send({ result: output1.result });
    let finalResult;
    if (output1) {
      // const imageUrl2 = `https://${req.get("host")}/images/${req.file.filename}`;
      // console.log(`Public URL for the uploaded image: ${imageUrl2}`);

      const output2 = await replicate.run(
        "zsxkib/diffbir:51ed1464d8bbbaca811153b051d3b09ab42f0bdeb85804ae26ba323d7a66a4ac",
        {
          input: {
            seed: 231,
            // org_image: imageUrl1,
            // mask_image: output1,
            input: output1,
            // objects_to_remove: "person",
            // input_image: imageUrl,
            // image: imageUrl,
            // prompt: "human",
            // objects_to_remove: "person",
            steps: 50,
            tiled: false,
            tile_size: 512,
            has_aligned: false,
            tile_stride: 256,
            repeat_times: 1,
            use_guidance: false,
            color_fix_type: "wavelet",
            guidance_scale: 0,
            guidance_space: "latent",
            guidance_repeat: 5,
            only_center_face: false,
            guidance_time_stop: -1,
            guidance_time_start: 1001,
            background_upsampler: "RealESRGAN",
            face_detection_model: "retinaface_resnet50",
            upscaling_model_type: "general_scenes",
            restoration_model_type: "general_scenes",
            super_resolution_factor: 2,
            disable_preprocess_model: false,
            reload_restoration_model: false,
            background_upsampler_tile: 400,
            background_upsampler_tile_stride: 400,
          },
        },
      );

      console.log("Replicate API call successful. Output2:", output2[0]);

      downloadAndSaveImage(output2[0], "result");

      finalResult = output2.result;
    } else {
      finalResult = output1.result;
    }

    res.send({ result: finalResult });
  } catch (error) {
    console.error("Error during Replicate API call:", error);
    res
      .status(500)
      .send({ error: "Failed to call Replicate API", details: error.message });
  }
});

app.get("/img/:id", (req, res) => {
  console.log(req.params.id);
  res.type("jpeg").send(path.join(__dirname, "public/images/") + req.params.id);
});

app.listen(3000, () => {
  console.log("Express server listening on port 3000");
});
