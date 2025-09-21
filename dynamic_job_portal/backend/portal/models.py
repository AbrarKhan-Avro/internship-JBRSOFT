from django.db import models
from django.contrib.auth.models import User

# Admin-configurable dynamic form fields
class DynamicField(models.Model):
    FIELD_TYPES = [
        ('text', 'Text'),
        ('number', 'Number'),
        ('email', 'Email'),
        ('textarea', 'Textarea'),
        ('select', 'Select'),
    ]

    name = models.CharField(max_length=100)          # e.g., "Address"
    key = models.CharField(max_length=100, unique=True)  # e.g., "address"
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    options = models.JSONField(blank=True, null=True)   # for dropdown/select
    page = models.CharField(max_length=50)             # e.g., "registration", "profile"
    required = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.page} - {self.name}"


# Job listings
class Job(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    company = models.ForeignKey(User, on_delete=models.CASCADE)
    location = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.company.username}"


# Applications for jobs
class Application(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    data = models.JSONField()  # stores dynamic form responses as key-value pairs
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.candidate.username} -> {self.job.title}"
