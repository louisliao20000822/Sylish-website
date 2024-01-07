# -*- coding: utf-8 -*-
"""
Created on Thu Nov  4 13:44:17 2021

@author: heng
"""

from django.urls import path
from . import views
 
urlpatterns = [
    path('callback', views.callback)
]
