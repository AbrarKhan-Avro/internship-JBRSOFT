from django.conf import settings
from django.db import models
from django.utils.text import slugify


def upload_to_submission(instance, filename):
    """
    Path for storing submission files.
    Example: submissions/<submission_id>/<field_name>/<original_filename>
    """
    # sanitize filename minimally by replacing spaces (you can extend this)
    safe_filename = filename.replace(" ", "_")
    return f"submissions/{instance.submission.id}/{instance.field_name}/{safe_filename}"


class Page(models.Model):
    """
    A page that can be rendered on the frontend (e.g. registration, login, job_post, job_apply, profile).
    Admins can toggle `requires_login` to force authentication for submissions on this page.
    """
    title = models.CharField(max_length=200)
    slug = models.SlugField(
        max_length=200,
        unique=True,
        help_text="Unique slug used by frontend to fetch this page"
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, help_text="If false the page will not be served by the API")
    requires_login = models.BooleanField(default=False, help_text="If true, only authenticated users may submit this page")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        verbose_name = "Page"
        verbose_name_plural = "Pages"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Field(models.Model):
    """
    Field definitions for a Page.
    Each Field describes the type, validation, and display metadata required by the frontend.
    """
    FIELD_TYPES = [
        ("text", "Text"),
        ("textarea", "Textarea"),
        ("email", "Email"),
        ("password", "Password"),
        ("number", "Number"),
        ("date", "Date"),
        ("checkbox", "Checkbox"),         # single boolean checkbox
        ("checkboxes", "Multiple Checkboxes"),  # multiple choices (list)
        ("radio", "Radio"),
        ("select", "Select/Dropdown"),
        ("file", "File Upload"),
        ("hidden", "Hidden"),
    ]

    page = models.ForeignKey(Page, related_name="fields", on_delete=models.CASCADE)
    name = models.SlugField(
        max_length=150,
        help_text="Unique field key used in form data (e.g. first_name)"
    )
    label = models.CharField(max_length=200)
    field_type = models.CharField(max_length=30, choices=FIELD_TYPES, default="text")
    placeholder = models.CharField(max_length=255, blank=True)
    default_value = models.CharField(max_length=255, blank=True)
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0, help_text="Lower order renders earlier")
    help_text = models.CharField(max_length=255, blank=True)
    # validation rules stored as JSON, for example:
    # {"min_length": 3, "max_length": 100, "regex": "^[A-Za-z ]+$", "min": 0, "max": 100}
    validation = models.JSONField(blank=True, default=dict)

    class Meta:
        ordering = ["order", "id"]
        unique_together = ("page", "name")
        verbose_name = "Field"
        verbose_name_plural = "Fields"

    def __str__(self):
        return f"{self.page.slug}:{self.name} ({self.field_type})"


class FieldOption(models.Model):
    """
    Options for fields that require choices (select, radio, checkboxes).
    Stored as label/value pairs and ordered.
    """
    field = models.ForeignKey(Field, related_name="options", on_delete=models.CASCADE)
    label = models.CharField(max_length=200)
    value = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Field Option"
        verbose_name_plural = "Field Options"

    def __str__(self):
        return f"{self.field.name} -> {self.label}"


class FormSubmission(models.Model):
    """
    Represents a form submission for a Page. The submitted values are stored in `data` as JSON.
    If files are uploaded, they are saved in SubmissionFile and referenced in `data` by filename/path.
    Optionally linked to a user (if the submitter was authenticated).
    """
    page = models.ForeignKey(Page, related_name="submissions", on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="submissions",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Optional - the authenticated user who submitted the form"
    )
    data = models.JSONField(default=dict, help_text="Submitted form data: field_name -> value")
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    meta = models.JSONField(blank=True, default=dict, help_text="Optional metadata (user agent, etc)")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Form Submission"
        verbose_name_plural = "Form Submissions"

    def __str__(self):
        return f"Submission {self.id} for Page {self.page_id}"


class SubmissionFile(models.Model):
    """
    Stores uploaded files associated with a FormSubmission.
    The upload path uses the submission id and field name for organization.
    """
    submission = models.ForeignKey(FormSubmission, related_name="files", on_delete=models.CASCADE)
    field_name = models.CharField(max_length=150)
    file = models.FileField(upload_to=upload_to_submission)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Submission File"
        verbose_name_plural = "Submission Files"

    def __str__(self):
        # When the file is not yet saved file.name may raise; guard it.
        fname = getattr(self.file, "name", None)
        return f"File for submission {self.submission_id}: {self.field_name} -> {fname}"
