from kivy.app import App
from kivy.network.urlrequest import UrlRequest
from typing import Callable
import json

class GeneralRequest:
    def __init__(self, url:str, req_body:str=None, req_headers:dict=None, on_success:Callable=None, refresh:str=None):
        self.refresh = refresh
        UrlRequest(url, req_body=req_body, req_headers=req_headers, on_success=on_success, on_failure=self.on_failure)
    
    def on_failure(self, request, result):
        print(result)
        print('Refreshing access token')
        if (self.refresh):
            UrlRequest('https://triple-j.onrender.com/api/account/token/refresh', on_success=self.on_refresh, req_body=json.dumps({'refresh': self.refresh}), req_headers={"Content-Type" : "application/json"})
    
    def on_refresh(self, request, result):
        app = App.get_running_app()
        app.access = result.get('access')
        print('Access token refreshed')