from kivymd.uix.screen import MDScreen
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.pickers import MDDatePicker
from kivy.app import App
from datetime import date
import requests

months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novermber', 'December']


class HomeScreen(MDScreen):
    dialog = None
    selected_date:date = date.today()
    year:int
    month:int
    day:int

    def on_enter(self):
        self.app = App.get_running_app()
        self.ids.date_btn.text = self.selected_date.isoformat()
        self.get_attendances()
    
    def get_attendances(self):
        response = requests.get(self.app.base_url + f"api/attendance/attendances/{str(self.selected_date.year)}/{str(self.selected_date.month)}/{str(self.selected_date.day)}", headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'})
        if (response.ok):
            self.ids.container.clear_widgets()
            for attendance in response.json():
                attendanceComponent = AttendanceComponent()
                attendanceComponent.set_details(username=attendance.get('member', "Not found"), timeIn=attendance.get('timeIn', "Not Found"), timeOut=attendance.get('timeOut', "Not Found"), root=self)
                self.ids.container.add_widget(attendanceComponent)
    
    def open_menu(self):
        date_picker = MDDatePicker()
        date_picker.bind(on_save=self.date_selected)
        date_picker.open()


    def date_selected(self, instance, value:date, date_range):
        self.selected_date = value
        self.ids.date_btn.text = value.isoformat()
        self.get_attendances()
    
    def register_email(self, email):
        if (email):
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

    def display_details(self, username, timeIn, timeOut):
        response = requests.get(self.app.base_url + f'api/account/member/{username}', headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'})
        
        data = response.json()
        if (data.get('id', None)):
            response = requests.get(self.app.base_url + f'api/account/membership?id={str(data.get('id'))}', headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'})
            self.ids.time_out.text = str(timeOut)
            self.ids.time_in.text = str(timeIn)
            self.ids.member_name.text = f'{data.get('first_name')} {data.get('last_name')}'
            self.ids.membership_type.text = data.get('membershipType')
            if (data.get('membershipType') == 'Monthly' and response.get('id')):
                print(response.text)


class AttendanceComponent(MDBoxLayout):
    def set_details(self, username, timeIn, timeOut, root:HomeScreen):
        self.root = root
        self.username = username
        self.timeIn = timeIn
        self.timeOut = timeOut
        self.ids.username.text = username
        self.ids.timeIn.text = str(timeIn)
        self.ids.timeOut.text = str(timeOut)
    
    def on_touch_up(self, instance):
        self.root.display_details(self.username, self.timeIn, self.timeOut)

