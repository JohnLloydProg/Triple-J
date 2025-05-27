from kivymd.uix.screen import MDScreen
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivymd.uix.boxlayout import MDBoxLayout
from kivy.app import App
import requests


class HomeScreen(MDScreen):
    dialog = None

    def on_enter(self):
        self.app = App.get_running_app()
        response = requests.get(self.app.base_url + "api/attendance/attendances/2025/5/27", headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'})
        if (response.ok):
            print(response.text, response.json())
    
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


class AttendanceComponent(MDBoxLayout):
    def set_details(self, username, timeIn, timeOut):
        self.ids.username.text = f'Username: {username}'
        self.ids.timeIn.text = f'Time In: {str(timeIn)}'
        self.ids.timeOut.text = f'Time Out: {str(timeOut)}'

