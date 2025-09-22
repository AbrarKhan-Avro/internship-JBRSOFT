# backend/jobs/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Page, FormSubmission, SubmissionFile
from .serializers import PageSerializer, FormSubmissionSerializer, DynamicFormSubmissionSerializer
from django.shortcuts import get_object_or_404
from django.db import transaction

class PageDetailAPIView(APIView):
    def get(self, request, slug):
        page = get_object_or_404(Page, slug=slug, is_active=True)
        serializer = PageSerializer(page, context={"request": request})
        return Response(serializer.data)


class PageSubmitAPIView(APIView):
    def post(self, request, slug):
        page = get_object_or_404(Page, slug=slug, is_active=True)

        # Group uploaded files by field name
        files_by_field = {}
        for key in request.FILES:
            # Django's request.FILES behaves like a dict of UploadedFile objects.
            # If frontend may send multiple files with same field name, Django will provide a list via getlist in QueryDict,
            # but request.FILES is not QueryDict. We gather possible multiple files by checking request.FILES.getlist if available.
            file_list = request.FILES.getlist(key) if hasattr(request.FILES, "getlist") else [request.FILES[key]]
            files_by_field[key] = file_list

        # Validate using the dynamic serializer
        serializer = DynamicFormSubmissionSerializer(data=request.data, context={"page": page, "files": files_by_field})
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response({"detail": "Validation error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        cleaned = serializer.validated_data.get("cleaned_data", {})

        # Save submission and files atomically
        with transaction.atomic():
            submission = FormSubmission.objects.create(
                page=page,
                data=cleaned,
                ip_address=get_client_ip(request),
                meta={"user_agent": request.META.get("HTTP_USER_AGENT", "")}
            )
            # Save files and append saved filenames/paths into submission.data
            for field_name, files in files_by_field.items():
                saved_names = []
                for f in files:
                    sf = SubmissionFile(submission=submission, field_name=field_name, file=f)
                    sf.save()
                    saved_names.append(sf.file.name)
                # store list of stored file paths/names in JSON data
                submission.data[field_name] = saved_names if len(saved_names) > 1 else (saved_names[0] if saved_names else [])
            submission.save()

        out = FormSubmissionSerializer(submission, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)


def get_client_ip(request):
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
