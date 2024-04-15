document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("video");
  const captureButton = document.getElementById("processImage");

  // 准备一个canvas来捕获和发送图像
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // 获取用户的媒体设备（前置或后置摄像头）
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Error accessing the camera", err);
    });
  captureButton.addEventListener("click", () => {
    // 设置canvas尺寸与视频流一致
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    // 在canvas上绘制当前视频帧
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // 将canvas中的图像转换为数据URL（即base64编码的JPEG图像）
    const imageDataUrl = canvas.toDataURL("image/jpeg");
    // 使用fetch API发送数据URL到后端服务
    fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageDataUrl }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.result);
        const resultImage = document.getElementById("resultImage");
        resultImage.src = data.result;
      })
      .catch((err) => {
        console.error("Failed to send image", err);
      });
  });
});
