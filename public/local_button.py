from gpiozero import Button, OutputDevice



from signal import pause



import requests







output_pin = OutputDevice(5)



input_pin = Button(6)







# Make sure to update this URL to where your Flask app is hosted



server_url = 'https://2aef9f9f-fdcc-4e9a-8e74-cc0e03f6c2cb-00-qserc73648r.janeway.replit.dev/'







output_pin.on()







def send_state_change(state):



    url = f'{server_url}/button/pressed'



    try:



        response = requests.post(url, json={'state': state})



        print(f"button {state}, server responded:", response.json())



    except requests.exceptions.RequestException as e:



        print("failed", e)







def when_high():



    send_state_change('high')







def when_low():



    send_state_change('low')







input_pin.when_pressed = when_high



input_pin.when_released = when_low







pause()