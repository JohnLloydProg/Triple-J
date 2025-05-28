from kivymd.app import MDApp
from kivy.lang import Builder
from kivymd.uix.screenmanager import MDScreenManager
from kivymd.uix.screen import MDScreen
from kivy.resources import resource_find, resource_add_path
from controller.main import MainScreen
from controller.home import HomeScreen


def load_kv_files():
    design_files = ['./components.kv','./design/main.kv', './design/home.kv']
    for design_file in design_files:
        Builder.load_file(design_file)


class TripleJAdmin(MDApp):
    base_url = 'https://triple-j.onrender.com/'
    access = None
    refresh = None

    def build(self):
        self.sm = MDScreenManager()
        mainScreen = MainScreen(name='main_screen')
        self.sm.add_widget(mainScreen)
        homeScreen = HomeScreen(name='home_screen')
        self.sm.add_widget(homeScreen)
        self.sm.current = 'main_screen'
        return self.sm
    

if __name__ == "__main__":
    load_kv_files()
    TripleJAdmin().run()

