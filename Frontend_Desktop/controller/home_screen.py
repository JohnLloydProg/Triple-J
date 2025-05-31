from kivymd.uix.screen import MDScreen
from kivymd.uix.dialog import MDDialog
from kivymd.uix.button import MDFlatButton
from kivymd.uix.boxlayout import MDBoxLayout
from kivymd.uix.pickers import MDDatePicker
from kivy.network.urlrequest import UrlRequest, UrlRequestUrllib
from kivymd.uix.behaviors import HoverBehavior
from tools import GeneralRequest
from kivy.app import App
from datetime import date
import json

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
        self.get_attendances = lambda: GeneralRequest(
            self.app.base_url + f"api/attendance/attendances/{str(self.selected_date.year)}/{str(self.selected_date.month)}/{str(self.selected_date.day)}",
            req_headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'}, on_success=self.got_attendances, refresh=self.app.refresh
        )
        self.get_attendances()
    
    def got_attendances(self, request:UrlRequestUrllib, result:dict):
        self.ids.container.clear_widgets()
        for attendance in result:
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
            GeneralRequest(
                self.app.base_url + 'api/account/email-validation',
                req_body=json.dumps({'email': email}), req_headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'},
                on_success=lambda request, result: self.dialog.open(), refresh=self.app.refresh
            )

    def call_details(self, username, timeIn, timeOut):
        GeneralRequest(
            self.app.base_url + f'api/account/member/{username}', req_headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'},
            on_success=lambda request, result: self.display_details(username, timeIn, timeOut, result), refresh=self.app.refresh
        )
    
    def display_details(self, username, timeIn, timeOut, result:dict):
        self.ids.time_out.text = str(timeOut)
        self.ids.time_in.text = str(timeIn)
        self.ids.member_name.text = f'{result.get('first_name')} {result.get('last_name')}'
        self.ids.membership_type.text = result.get('membershipType')
        if (result.get('membershipType') == 'Monthly'):
            GeneralRequest(
                self.app.base_url + f'api/account/membership?id={str(result.get('id'))}', req_headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'}, 
                on_success=self.display_membership_expiry, refresh=self.app.refresh
            )
    
    def display_membership_expiry(self, request, result):
        self.ids.membership_expiry.text = result.get('expirationDate', 'Not Found!')
                


class AttendanceComponent(MDBoxLayout, HoverBehavior):
    def set_details(self, username, timeIn, timeOut, root:HomeScreen):
        self.root = root
        self.username = username
        self.timeIn = timeIn
        self.timeOut = timeOut
        self.ids.username.text = username
        self.ids.timeIn.text = str(timeIn)
        self.ids.timeOut.text = str(timeOut)
    
    def on_touch_up(self, instance):
        self.root.call_details(self.username, self.timeIn, self.timeOut)
    
    def on_enter(self, *args):
        self.md_bg_color = (80/255, 80/255, 80/255, 1)
    
    def on_leave(self, *args):
        self.md_bg_color = (94/255, 92/255, 92/255, 1)

