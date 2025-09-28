from django.contrib import admin
from django.urls import path
from forms_engine.views import (
    PageListView,
    PageDetailView,
    SubmitFormView,
)
from forms_engine.api_views import page_submissions   # ✅ keep your new endpoint

urlpatterns = [
    path("admin/", admin.site.urls),

    # ✅ Corrected API endpoints
    path("api/pages/", PageListView.as_view(), name="page-list"),
    path("api/pages/<slug:slug>/", PageDetailView.as_view(), name="page-detail"),
    path("api/pages/<slug:slug>/submit/", SubmitFormView.as_view(), name="page-submit"),

    # ✅ New endpoint for job listings
    path("api/pages/<slug:slug>/submissions/", page_submissions, name="page-submissions"),
]
