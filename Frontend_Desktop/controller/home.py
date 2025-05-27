from kivymd.uix.screen import MDScreen
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.menu import MDDropdownMenu
from kivy.app import App
from datetime import date
import requests

months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novermber', 'December']


class HomeScreen(MDScreen):
    dialog = None
    year:int
    month:int
    day:int

    def on_enter(self):
        self.app = App.get_running_app()
        d = date.today()
        self.month = d.month
        self.ids.year.text = str(d.year)
        self.ids.months_btn.text = months[self.month-1]
        self.ids.day.text = str(d.day)
        self.get_attendances()
    
    def get_attendances(self):
        response = requests.get(self.app.base_url + f"api/attendance/attendances/{self.ids.year.text}/{str(self.month)}/{self.ids.day.text}", headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'})
        if (response.ok):
            self.ids.container.clear_widgets()
            for attendance in response.json():
                attendanceComponent = AttendanceComponent()
                attendanceComponent.set_details(username=attendance.get('member', "Not found"), timeIn=attendance.get('timeIn', "Not Found"), timeOut=attendance.get('timeOut', "Not Found"))
                self.ids.container.add_widget(attendanceComponent)
    
    def open_menu(self, item):
        menu_items = [
            {
                "text": month,
                "on_release": lambda: self.menu_callback(month),
            } for month in months
        ]
        self.dropDown = MDDropdownMenu(caller=item, items=menu_items)
        self.dropDown.open()

    def menu_callback(self, month):
        self.ids.months_btn.text = month
        self.month = months.index(month) + 1
        self.dropDown.dismiss()

    
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

