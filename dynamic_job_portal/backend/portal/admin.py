from django.contrib import admin
from .models import DynamicField, Job, Application

admin.site.register(DynamicField)
admin.site.register(Job)
admin.site.register(Application)
