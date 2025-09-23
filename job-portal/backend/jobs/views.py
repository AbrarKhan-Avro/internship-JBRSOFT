# backend/jobs/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction

from .models import Page, FormSubmission, SubmissionFile
from .serializers import PageSerializer, FormSubmissionSerializer, DynamicFormSubmissionSerializer


class PageDetailAPIView(APIView):
    """
    GET /api/pages/<slug>/
    Returns Page definition (including fields and options).
    """
    def get(self, request, slug):
        page = get_object_or_404(Page, slug=slug, is_active=True)
        serializer = PageSerializer(page, context={"request": request})
        return Response(serializer.data)


class PageSubmitAPIView(APIView):
    """
    POST /api/pages/<slug>/submit/
    Accepts form data (including multipart file uploads). Behavior:
      - If the Page.requires_login flag is True, the user must be authenticated.
      - Validates incoming data using DynamicFormSubmissionSerializer.
      - Saves a FormSubmission and associated SubmissionFile objects atomically.
    """
    def post(self, request, slug):
        page = get_object_or_404(Page, slug=slug, is_active=True)

        # If admin set this page to require login, enforce authentication
        if getattr(page, "requires_login", False) and not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required to submit this form."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Group uploaded files by field name (supporting multiple files per field)
        files_by_field = {}
        # request.FILES is a MultiValueDict, so getlist is available in Django
        for key in request.FILES:
            file_list = request.FILES.getlist(key) if hasattr(request.FILES, "getlist") else [request.FILES[key]]
            files_by_field[key] = file_list

        # Validate incoming data using the dynamic serializer.
        # Pass page and files so serializer can validate required/file rules.
        serializer = DynamicFormSubmissionSerializer(data=request.data, context={"page": page, "files": files_by_field})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({"detail": "Validation error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        cleaned = serializer.validated_data.get("cleaned_data", {}) or {}

        # Save submission and files atomically
        with transaction.atomic():
            submission = FormSubmission.objects.create(
                page=page,
                user=request.user if request.user.is_authenticated else None,
                data=cleaned.copy(),  # start with validated cleaned data
                ip_address=get_client_ip(request),
                meta={"user_agent": request.META.get("HTTP_USER_AGENT", "")}
            )

            # Save uploaded files and update submission.data for file fields
            for field_name, files in files_by_field.items():
                saved_paths = []
                for f in files:
                    sf = SubmissionFile(submission=submission, field_name=field_name, file=f)
                    sf.save()
                    # sf.file.name is the stored path relative to MEDIA_ROOT
                    saved_paths.append(sf.file.name)

                # Normalize to list for consistency (even single file stored as list)
                # Merge with existing cleaned value if appropriate (e.g., checkboxes)
                existing_value = submission.data.get(field_name)
                if existing_value:
                    # If existing_value is list-like, extend it; else create a list
                    if isinstance(existing_value, list):
                        submission.data[field_name] = existing_value + saved_paths
                    else:
                        submission.data[field_name] = [existing_value] + saved_paths
                else:
                    submission.data[field_name] = saved_paths

            # Persist any changes to submission.data
            submission.save()

        out = FormSubmissionSerializer(submission, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)


def get_client_ip(request):
    """
    Attempt to extract real client IP from request headers.
    """
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        # X-Forwarded-For can contain a list of IPs; the client's IP is the first one
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
