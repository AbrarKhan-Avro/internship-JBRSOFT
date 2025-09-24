from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.text import slugify
from django.core.validators import RegexValidator

# ---------- Choices ---------- #
FIELD_TYPES = [
    ("text", "Text"),
    ("textarea", "Textarea"),
    ("email", "Email"),
    ("password", "Password"),
    ("number", "Number"),
    ("date", "Date"),
    ("checkbox", "Checkbox"),
    ("radio", "Radio"),
    ("dropdown", "Dropdown"),
    ("file", "File Upload"),
]


class Page(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Field(models.Model):
    page = models.ForeignKey(Page, related_name="fields", on_delete=models.CASCADE)
    label = models.CharField(max_length=200)
    name = models.SlugField(
        max_length=100,
        help_text="Internal field name (no spaces)",
        validators=[RegexValidator(r"^[a-zA-Z0-9_]+$", "Use letters, numbers or underscores.")],
    )
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    placeholder = models.CharField(max_length=200, blank=True)
    default_value = models.CharField(max_length=200, blank=True)
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.page.name} - {self.label}"


class FieldOption(models.Model):
    field = models.ForeignKey(Field, related_name="options", on_delete=models.CASCADE)
    value = models.CharField(max_length=200)
    label = models.CharField(max_length=200)

    def __str__(self):
        return f"{self.field.label} -> {self.label}"


class FormSubmission(models.Model):
    page = models.ForeignKey(Page, related_name="submissions", on_delete=models.CASCADE)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission to {self.page.name} @ {self.created_at}"
