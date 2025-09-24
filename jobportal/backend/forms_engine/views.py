from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Page, FormSubmission
from .serializers import (
    PageListSerializer,
    PageDetailSerializer,
    FormSubmissionSerializer,
)


class PageListView(generics.ListAPIView):
    queryset = Page.objects.all()
    serializer_class = PageListSerializer


class PageDetailView(generics.RetrieveAPIView):
    lookup_field = "slug"
    queryset = Page.objects.all()
    serializer_class = PageDetailSerializer


class SubmitFormView(APIView):
    def post(self, request, slug):
        page = get_object_or_404(Page, slug=slug)
        serializer = FormSubmissionSerializer(data={
            "page": page.id,
            "data": request.data,
        })
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Form submitted successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
