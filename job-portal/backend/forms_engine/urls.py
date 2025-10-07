from django.urls import path
from . import views

urlpatterns = [
    # Dynamic Form Engine Endpoints
    path('pages/', views.PageListView.as_view(), name='page-list'),
    path('pages/<slug:slug>/', views.PageDetailView.as_view(), name='page-detail'),
    path('submit/<slug:slug>/', views.FormSubmissionView.as_view(), name='form-submit'),

    # Jobs Endpoint
    path("jobs/", views.list_jobs, name="list_jobs"),
]
