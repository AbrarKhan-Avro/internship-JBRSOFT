from rest_framework import generics
from .models import Page
from .serializers import PageSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Page, Field, FormSubmission
from .serializers import FormSubmissionSerializer
from .models import Job
from .serializers import JobSerializer
from rest_framework.decorators import api_view
from .models import FormSubmission

class PageListView(generics.ListAPIView):
    """List all available pages (Registration, Login, etc.)"""
    queryset = Page.objects.all()
    serializer_class = PageSerializer


class PageDetailView(generics.RetrieveAPIView):
    """Retrieve a single page with all its fields and options"""
    queryset = Page.objects.all()
    serializer_class = PageSerializer
    lookup_field = 'slug'


class FormSubmissionView(APIView):
    """Accepts dynamic form submissions for any page."""

    def post(self, request, slug):
        try:
            page = Page.objects.get(slug=slug)
        except Page.DoesNotExist:
            return Response({'error': 'Page not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch all fields for validation
        fields = page.fields.all()
        field_dict = {f.name: f for f in fields}

        data = request.data
        errors = {}

        # Validate fields
        for field_name, field_obj in field_dict.items():
            value = data.get(field_name)
            if field_obj.required and not value:
                errors[field_name] = "This field is required."

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        # Store submission as JSON
        submission = FormSubmission.objects.create(page=page, data=data)
        serializer = FormSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def list_jobs(request):
    """Return all submitted job posts."""
    submissions = FormSubmission.objects.filter(page__slug="post-job").order_by("-submitted_at")
    serializer = FormSubmissionSerializer(submissions, many=True)
    return Response(serializer.data)
