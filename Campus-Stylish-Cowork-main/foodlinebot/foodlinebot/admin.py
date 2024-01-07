from django.contrib import admin

# Register your models here.
from foodlinebot.models import *

class User_Info_Admin(admin.ModelAdmin):
    list_display = ('uid','name','pic_url','mtext','mdt','blist','money')
admin.site.register(User_Info,User_Info_Admin)


 