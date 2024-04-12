document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const captureButton = document.getElementById('processImage');
    const context = canvas.getContext('2d');

    // 获取摄像头权限并显示视频流
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            console.error("Error accessing the camera", err);
        });

    captureButton.addEventListener('click', () => {
        // 设置canvas尺寸与视频流相同
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 将视频帧绘制到canvas上
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // 转换canvas内容为Blob对象
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('image', blob, 'userImage.jpg');

            // 发送POST请求到后端API，包含捕捉的图片
            fetch('/api/', { // 确保这里的URL匹配您的API端点
                method: 'POST',
                body: formData,
            })
            .then(response => response.json())
            .then(data => {
                // 假定后端返回的是处理过的图片URL
                document.getElementById('resultImage').src = data.result;
            })
            .catch(err => {
                console.error("Failed to send image", err);
            });
        }, 'image/jpeg');
    });
});