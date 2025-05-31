from kivymd.uix.screen import MDScreen
from kivy.app import App
import requests
import json


class MainScreen(MDScreen):
    def on_enter(self):
        self.app = App.get_running_app()
        try:
            with open('./token.json', 'r') as f:
                token = json.loads(f.read()).get('refresh')
                response = requests.post(self.app.base_url + 'api/account/token/refresh', json={'refresh': token})
                data = response.json()
                if (data.get('access', None)):
                    self.app.access = data.get('access')
                    self.app.refresh = token
                    self.app.sm.current = 'home_screen'
        except FileNotFoundError:
            print('no token!')
    
    def login(self):
        username = self.ids.username.text
        password = self.ids.password.text
        response = requests.post(self.app.base_url + 'api/account/token', json={'username': username, 'password': password})
        data = response.json()
        if (data.get('access', None)):
            self.app.access = data.get('access')
            self.app.refresh = data.get('refresh')
            with open('./token.json', 'w') as f:
                f.write(json.dumps({'refresh': data.get('refresh')}))
            self.app.sm.current = 'home_screen'
