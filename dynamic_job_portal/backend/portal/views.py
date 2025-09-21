from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import DynamicField, Job, Application
from .serializers import DynamicFieldSerializer, JobSerializer, ApplicationSerializer, UserSerializer
from django.contrib.auth.models import User

# Get dynamic fields for a page
@api_view(['GET'])
def get_dynamic_fields(request):
    page = request.GET.get('page', None)
    if page:
        fields = DynamicField.objects.filter(page=page)
    else:
        fields = DynamicField.objects.all()
    serializer = DynamicFieldSerializer(fields, many=True)
    return Response(serializer.data)

# Job APIs
class JobListCreate(generics.ListCreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class JobDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

# Application API
class ApplyJob(generics.CreateAPIView):
    serializer_class = ApplicationSerializer

# User registration API
class UserRegister(generics.CreateAPIView):
    serializer_class = UserSerializer
