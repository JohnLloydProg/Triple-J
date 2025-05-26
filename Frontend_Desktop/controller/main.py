from kivymd.uix.screen import MDScreen
from kivy.app import App
import requests


class MainScreen(MDScreen):
    def on_enter(self):
        self.app = App.get_running_app()
        print('MainScreen on_enter called')
    
    def login(self):
        username = self.ids.username.text
        password = self.ids.password.text
        response = requests.post(self.app.base_url + 'api/account/token', json={'username': username, 'password': password})
        data = response.json()
        if (data.get('access', None)):
            self.app.access = data.get('access')
            self.app.refresh = data.get('refresh')
            self.app.sm.current = 'home_screen'
