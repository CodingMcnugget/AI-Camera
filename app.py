from flask import Flask, jsonify, request
import requests

app = Flask(__name__)

@app.route('/button/pressed', methods=['POST'])
def notify_index_js(state):
    url = f"http://localhost:3000/button/pressed/high"
    try:
        response = requests.post(url, json={"state": state})
        # 检查响应是否为JSON类型和状态码是否为200
        if response.status_code == 200 and response.headers.get('Content-Type', '').startswith('application/json'):
            return jsonify({
                "success": True, 
                "message": f"Successfully sent {state} state change to index.js", 
                "response": response.json()
            }), 200
        else:
            # 处理非JSON响应或不同的状态码
            return jsonify({
                "success": False, 
                "message": "Failed to send state change to index.js",
                "response_content": response.text  # 将响应内容作为文本返回以便调试
            }), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "message": f"Request failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000)
