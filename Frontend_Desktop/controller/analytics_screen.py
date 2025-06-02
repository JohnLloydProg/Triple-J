from kivymd.uix.screen import MDScreen
from kivy_garden.matplotlib.backend_kivyagg import FigureCanvasKivyAgg
import matplotlib.pyplot as plt
from kivy.app import App
from tools import GeneralRequest
from datetime import date
import numpy as np

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


class AnalyticsScreen(MDScreen):
    month:str = months[date.today().month - 1]
    peak_done = False

    def on_enter(self):
        self.app = App.get_running_app()
        self.reset_btns()
        GeneralRequest(
            self.app.base_url + 'api/analytics/members/report', 
            req_headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'},
            on_success=self.got_members_data, refresh=self.app.refresh
        )
    
    def got_members_data(self, request, result):
        self.ids.pie_charts.clear_widgets()
        demographics:dict = result.get('demographics')
        memberships:dict = result.get('memberships')
        workouts:dict = result.get('workouts')
        demographics_x = []
        demographics_labels = []
        memberships_x = []
        memberships_labels = []
        workouts_x = []
        workouts_labels = []
        for key in demographics.keys():
            value = demographics[key]
            if (value > 0):
                demographics_x.append(value)
                demographics_labels.append(key)
        for key in memberships.keys():
            value = memberships[key]
            if (value > 0):
                memberships_x.append(value)
                memberships_labels.append(key)
        for key in workouts.keys():
            value = workouts[key]
            if (value > 0):
                workouts_x.append(value)
                workouts_labels.append(key)

        figure, axis = plt.subplots(1, 3)
        axis[0].pie(demographics_x, labels=demographics_labels)
        axis[0].set_title('Demographics')
        axis[1].pie(memberships_x, labels=memberships_labels)
        axis[1].set_title('Memberships')
        axis[2].pie(workouts_x, labels=workouts_labels)
        axis[2].set_title('Workouts')
        self.ids.pie_charts.add_widget(FigureCanvasKivyAgg(plt.gcf()))
        plt.figure()

        self.ids.member_number.text = f'{str(result.get('number'))} Members'
    
    def get_activity_data(self):
        plt.figure()
        
        figure, self.axis = plt.subplots(1, 2)

        GeneralRequest(
            self.app.base_url + f'api/analytics/peak/{str(months.index(self.month)+1)}', 
            req_headers={"Content-Type" : "application/json",'Authorization': f'Bearer {self.app.access}'},
            on_success=self.got_activity_data, refresh=self.app.refresh
        )
    
    def got_activity_data(self, request, result):
        index = 0 if (self.peak_done) else 1
        self.axis[index].plot(result.get('x'), labels=result.get('y'))
        self.axis[index].set_title()
        

    def select_month(self, month):
        self.month = month
        self.reset_btns()
    
    def reset_btns(self):
        for btn in self.ids.months_container.children:
            if (btn.text != self.month):
                btn.md_bg_color = self.app.theme['tertiary']
            else:
                btn.md_bg_color = self.app.theme['green']
        
