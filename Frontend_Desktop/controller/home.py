from kivymd.uix.screen import MDScreen
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivy.app import App
import requests

class HomeScreen(MDScreen):
    dialog = None

    def on_enter(self):
        self.app = App.get_running_app()
        print('HomeScreen on_enter called')
    
    def register_email(self, email):
        response = requests.post(self.app.base_url + 'api/account/email-validation', json={'email': email}, headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'})
        data = response.json()
        print(response.text)
        if (data.get('details') == "Email sent successfully"):
            self.dialog = MDDialog(
                title="Email Sent",
                text="Please check your email for the verification link.",
                buttons=[
                    MDFlatButton(
                        text="OK",
                        on_release=lambda x: self.dialog.dismiss()
                    )
                ]
            )
            self.dialog.open()

