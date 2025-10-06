"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # Dynamic forms API
    path('api/', include('forms_engine.urls')),

    # Authentication API (login/register)
    path('api/auth/', include('auth_app.urls')),
]
