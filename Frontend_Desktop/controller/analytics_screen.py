from kivymd.uix.screen import MDScreen
from kivy_garden.matplotlib.backend_kivyagg import FigureCanvasKivyAgg
import matplotlib.pyplot as plt
from kivy.app import App
from tools import GeneralRequest
from datetime import date

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
x=[11,22,33,44,55,66,77,88,99,100]
y=[12,6,9,15,23,67,11,90,34,91]


class AnalyticsScreen(MDScreen):
    month:str = months[date.today().month - 1]

    def on_enter(self):
        self.app = App.get_running_app()
        self.reset_btns()
        self.get_members_data = lambda: GeneralRequest(
            self.app.base_url + 'api/analytics/members/report', 
            req_headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'},
            on_success=self.got_members_data, refresh=self.app.refresh
            )
        self.get_members_data()
    
    def got_members_data(self, request, result):
        print(result)
        demographics = result.get('demographics')
        memberships = result.get('memberships')

        self.ids.member_number.text = str(result.get('number'))
        

    def select_month(self, month):
        self.month = month
        self.reset_btns()
    
    def reset_btns(self):
        for btn in self.ids.months_container.children:
            if (btn.text != self.month):
                btn.md_bg_color = self.app.theme['tertiary']
            else:
                btn.md_bg_color = self.app.theme['green']
        
