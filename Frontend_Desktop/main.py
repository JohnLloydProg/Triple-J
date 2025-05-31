from kivy.core.window import Window
Window.size = (1080, 720)
Window.minimum_width, Window.minimum_height = 1080, 720
from kivymd.app import MDApp
from kivy.lang import Builder
from kivymd.uix.screenmanager import MDScreenManager
from kivymd.uix.screen import MDScreen
from kivy.resources import resource_find, resource_add_path
from controller.main import MainScreen
from controller.home import HomeScreen
from kivy.network.urlrequest import UrlRequest, UrlRequestUrllib
import requests
import json


def load_kv_files():
    design_files = ['./components.kv','./design/main.kv', './design/home.kv']
    for design_file in design_files:
        Builder.load_file(design_file)


class TripleJAdmin(MDApp):
    base_url = 'https://triple-j.onrender.com/'
    access = None
    refresh = None
    theme = {
        'primary': (49/255, 48/255, 48/255, 1),
        'secondary': (30/255, 31/255, 38/255, 1),
        'tertiary': (94/255, 92/255, 92/255, 1),
        'accent': (234/255, 68/255, 68/255, 1),
        'green': (118/255, 208/255, 156/255, 1),
        'violet': (81/255, 71/255, 222/255, 1)
    }

    def build(self):
        self.sm = MDScreenManager()
        mainScreen = MainScreen(name='main_screen')
        self.sm.add_widget(mainScreen)
        homeScreen = HomeScreen(name='home_screen')
        self.sm.add_widget(homeScreen)
        self.sm.current = 'main_screen'
        return self.sm

    def on_start(self):
        try:
            with open('./token.json', 'r') as f:
                token = json.loads(f.read()).get('refresh')
                self.refresh = token
                UrlRequest(self.base_url + 'api/account/token/refresh', on_success=self.log_in, req_body=json.dumps({'refresh': token}), req_headers={"Content-Type" : "application/json"})
        except FileNotFoundError:
            print('no token!')
        return super().on_start()

    def log_in(self, request:UrlRequestUrllib, result:dict):
        self.access = result.get('access')
        self.sm.current = 'home_screen'
    

if __name__ == "__main__":
    load_kv_files()
    TripleJAdmin().run()

