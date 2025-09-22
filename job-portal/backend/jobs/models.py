from django.db import models
from django.contrib.postgres.fields import JSONField  # Django 4.2+ includes JSONField in models
from django.utils.text import slugify

class Page(models.Model):
    """
    A page that can be rendered on the frontend (registration, login, job_post, job_apply, profile, etc).
    """
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, help_text="Unique slug used by frontend to fetch this page")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["title"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Field(models.Model):
    """
    Field definitions for a Page.
    """
    FIELD_TYPES = [
        ("text", "Text"),
        ("textarea", "Textarea"),
        ("email", "Email"),
        ("password", "Password"),
        ("number", "Number"),
        ("date", "Date"),
        ("checkbox", "Checkbox"),        # single boolean checkbox
        ("checkboxes", "Multiple Checkboxes"),  # multiple choices
        ("radio", "Radio"),
        ("select", "Select/Dropdown"),
        ("file", "File Upload"),
        ("hidden", "Hidden"),
    ]

    page = models.ForeignKey(Page, related_name="fields", on_delete=models.CASCADE)
    name = models.SlugField(max_length=150, help_text="Unique field key used in form data (e.g. first_name)")
    label = models.CharField(max_length=200)
    field_type = models.CharField(max_length=30, choices=FIELD_TYPES, default="text")
    placeholder = models.CharField(max_length=255, blank=True)
    default_value = models.CharField(max_length=255, blank=True)
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, help_text="Lower order renders first")
    help_text = models.CharField(max_length=255, blank=True)
    # validation rules stored as JSON (min/max length, regex, min/max numeric, etc)
    validation = models.JSONField(blank=True, default=dict)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("page", "name")

    def __str__(self):
        return f"{self.page.slug}:{self.name} ({self.field_type})"


class FieldOption(models.Model):
    """
    Options for fields that require choices (select, radio, checkboxes).
    """
    field = models.ForeignKey(Field, related_name="options", on_delete=models.CASCADE)
    label = models.CharField(max_length=200)
    value = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.field.name} -> {self.label}"


def upload_to_submission(instance, filename):
    # Customize path storage for file uploads in submissions
    return f"submissions/{instance.submission.id}/{instance.field_name}/{filename}"


class FormSubmission(models.Model):
    """
    Represents a form submission for a Page. Stores raw data as JSON.
    Files are stored in SubmissionFile and referenced from JSON if needed.
    """
    page = models.ForeignKey(Page, related_name="submissions", on_delete=models.SET_NULL, null=True)
    data = models.JSONField()  # stores field name -> value (or filename(s) for files)
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    meta = models.JSONField(blank=True, default=dict)  # additional metadata if needed

    def __str__(self):
        return f"Submission {self.id} for {self.page_id}"


class SubmissionFile(models.Model):
    """
    Stores uploaded files associated with a FormSubmission.
    """
    submission = models.ForeignKey(FormSubmission, related_name="files", on_delete=models.CASCADE)
    field_name = models.CharField(max_length=150)
    file = models.FileField(upload_to=upload_to_submission)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File for {self.submission_id}: {self.field_name} -> {self.file.name}"
