import requests
import json


data = {'email':'johnlloydunida0@gmail.com', 'password':'Unida12345'}
r = requests.post('https://triple-j.onrender.com/api/account/authentication', data=data)
print(r.text)
r = requests.get(f'https://triple-j.onrender.com/api/attendance/qr-code', cookies=r.cookies)
print(r.text)
