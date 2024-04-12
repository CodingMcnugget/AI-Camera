import express from "express";
import multer from "multer";
import Replicate from "replicate";

const app = express();
app.use("/uploads", express.static("uploads"));
const upload = multer({ dest: "uploads/" }); // 设置文件的临时保存路径
const replicate = new Replicate();
app.use(express.static("public"));

// 修改此处以处理POST请求
app.post("/api/", upload.single("image"), async (req, res) => {
  // 假设您的表单数据中文件字段的名字为'image'
  console.log("Received image for processing");

  try {
    // 构建图片URL，使其可以通过Replicate API访问
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log(`Calling Replicate API with uploaded image at ${imageUrl}`);
    const output = await replicate.run(
      "schananas/grounded_sam:ee871c19efb1941f55f66a3d7d960428c8a5afcb77449547fe8e5a3ab9ebc21c",
      {
        input: {
          image: imageUrl, // 现在使用的是可访问的图片URL
          // 其他参数
        },
      },
    );
    console.log("Replicate API call successful. Output:", output);

    // 假设output中包含处理后的图片URL
    res.send({ result: output.result }); // 根据API返回的实际结果调整这里的字段
  } catch (error) {
    console.error("Error during Replicate API call:", error);
    res
      .status(500)
      .send({ error: "Failed to call Replicate API", details: error.message });
  }
});

app.listen(3000, () => {
  console.log("Express server listening on port 3000");
});
