from rest_framework import generics
from forms_engine.models import FormSubmission, Page
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def page_submissions(request, slug):
    try:
        page = Page.objects.get(slug=slug)
    except Page.DoesNotExist:
        return Response({"detail": "Page not found."}, status=404)

    subs = FormSubmission.objects.filter(page=page).order_by('-created_at')
    data = [
        {"id": s.id, "data": s.data, "created_at": s.created_at}
        for s in subs
    ]
    return Response(data)
