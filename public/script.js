document.addEventListener("DOMContentLoaded", async function () {
  const video = document.getElementById("video");

  // Set up canvas
  const canvas = document.getElementById("videoCanvas");
  const canvas2 = document.createElement("videoCanvas");
  const canvas3 = document.getElementById("videoCanvas");
  // canvas.color = "black";
  const context = canvas.getContext("2d");
  const context2 = canvas3.getContext("2d");
  let continueDrawing = true;
  let canvasCover = false;
  // context.rect(20, 20, 150, 100);
  // context.lineWidth = "6";
  // context.strokeStyle = "black";

  // Try to get camera access
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    await video.play(); // Explicitly try to play the video
  } catch (err) {
    console.error("Error accessing the camera or playing video", err);
    return; // Exit if no access to camera
  }

  // This version only draw canvas once
  // canvas.width = video.videoWidth;
  // canvas.height = video.videoHeight;
  // context.drawImage(video, 0, 0, canvas.width, canvas.height);
  // context.fillStyle = 'grey';
  // context.fillRect(75, 75, 150, 150);

  function drawVideo() {
    if (video.readyState === video.HAVE_ENOUGH_DATA && continueDrawing) {
      // Clear the canvas
      // context.clearRect(0, 0, canvas.width, canvas.height);
      // Draw the video framek
      canvas.width = window.innerHeight;
      canvas.height = window.innerHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
    // Loop this function
    requestAnimationFrame(drawVideo);
  }

  drawVideo();

  function coverVideo() {
    if (canvasCover) {
      const alpha = 0.1;
      canvas3.width = video.videoWidth;
      canvas3.height = video.videoHeight;
      context2.fillStyle = `rgba(0,255,255,${alpha})`;
      context2.fillRect(0, 0, canvas3.width, canvas3.height);
    }

    // Loop this function
    requestAnimationFrame(coverVideo);
  }

  // coverVideo()

  document.body.addEventListener("keydown", async () => {
    if (!video.videoWidth) {
      alert("Video is not ready or not playing.");
      return; // Ensure video is ready
    }

    // Set the canvas size same as video size
    canvas2.width = video.videoWidth * 2;
    canvas2.height = video.videoHeight * 2;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      console.log(blob);
      let formData = new FormData();
      formData.append("my-file", blob, `capture-${Date.now()}.jpeg`);

      try {
        const response = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch from server");
        }

        // setTimeout(() => {
        //   // context.fillRect(0, 0, canvas.width, canvas.height);
        // }, 1000);

        const data = await response.json();
        const resultImage = document.getElementById("resultImage");
        resultImage.src = data.result;
        console.log(resultImage.src);
      } catch (err) {
        console.error("Failed to send image or parse response", err);
      }
    }, "image/jpeg");
    continueDrawing = false;
    canvasCover = true;
    coverVideo();
  });
  // setTimeout(drawImge , 100);
  document.body.addEventListener("keyup", async (event) => {
    continueDrawing = true; // 重新开始绘制
    canvasCover = false;
    drawVideo(); // 确保重启绘制循环
  });
});
