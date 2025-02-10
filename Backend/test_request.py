import requests
import json


data = {'email':'johnlloydunida0@gmail.com', 'password':'Unida12345'}
r = requests.post('http://127.0.0.1:8000/api/account/authentication', data=data)
print(r.text)
r = requests.get(f'http://127.0.0.1:8000/api/attendance/qr-code', cookies=r.cookies)
print(r.text)
