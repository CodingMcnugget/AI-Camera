from flask import Flask
app = Flask(__name__)

@app.route('/button/pressed/high', methods=['GET'])
def button_pressed():
    # 处理按钮按下的逻辑
    return "Button pressed", 200

@app.route('/button/pressed/low', methods=['GET'])
def button_released():
    # 处理按钮释放的逻辑
    return "Button released", 200

if __name__ == '__main__':
    app.run(port=5000)