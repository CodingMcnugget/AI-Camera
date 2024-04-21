// 建立连接
const socket = io();

// 监听来自服务器的指令
socket.on('instruction', (data) => {
    console.log('Instruction from server:', data.message);
    // 根据指令执行操作，例如触发图片捕获
});

document.addEventListener("DOMContentLoaded", async function () {
  const video = document.getElementById("video");
  const captureButton = document.getElementById("processImage");

  // set up canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // get camera
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
    })
    .catch((err) => {
      console.error("Error accessing the camera", err);
    });

  // Polling for button press signal
  async function pollButtonPress() {
    try {
      const response = await fetch('/button/pressed/high');
      const data = await response.json();
      if (data.capture) {
        captureImage();
      }
    } catch (error) {
      console.error("Error polling button press", error);
    }
  }

  function captureImage() {
    console.log("Capturing image due to button press...");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      console.log(blob);
      let formData = new FormData();
      formData.append("my-file", blob, "filename.jpeg");
      try {
        const response = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log(data.result);
        const resultImage = document.getElementById("resultImage");
        resultImage.src = data.result;
      } catch (err) {
        console.error("Failed to send image", err);
      }
    }, "image/jpeg");
  }

  captureButton.addEventListener("click", captureImage);

  // Start polling
  setInterval(pollButtonPress, 3000);
});