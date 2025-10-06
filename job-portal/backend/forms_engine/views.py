from rest_framework import generics
from .models import Page
from .serializers import PageSerializer


class PageListView(generics.ListAPIView):
    """List all available pages (Registration, Login, etc.)"""
    queryset = Page.objects.all()
    serializer_class = PageSerializer


class PageDetailView(generics.RetrieveAPIView):
    """Retrieve a single page with all its fields and options"""
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = 'slug'
