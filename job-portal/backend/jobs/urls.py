# backend/jobs/urls.py
from django.urls import path
from .views import PageDetailAPIView, PageSubmitAPIView
from .auth_views import RegisterView, MeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("pages/<slug:slug>/", PageDetailAPIView.as_view(), name="page-detail"),
    path("pages/<slug:slug>/submit/", PageSubmitAPIView.as_view(), name="page-submit"),
    # auth
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
]
