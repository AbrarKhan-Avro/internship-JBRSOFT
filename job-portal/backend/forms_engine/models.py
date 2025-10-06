from django.db import models


class Page(models.Model):
    """Each page like Registration, Login, Profile, etc."""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, help_text="Used in URL, e.g. 'registration'")
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Field(models.Model):
    """A field that belongs to a Page."""
    FIELD_TYPES = [
        ('text', 'Text'),
        ('textarea', 'Textarea'),
        ('email', 'Email'),
        ('password', 'Password'),
        ('number', 'Number'),
        ('date', 'Date'),
        ('checkbox', 'Checkbox'),
        ('radio', 'Radio'),
        ('select', 'Dropdown'),
        ('file', 'File Upload'),
    ]

    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name='fields')
    label = models.CharField(max_length=100)
    name = models.SlugField(max_length=100, help_text="Unique name for this field")
    field_type = models.CharField(max_length=20, choices=FIELD_TYPES)
    placeholder = models.CharField(max_length=255, blank=True, null=True)
    default_value = models.CharField(max_length=255, blank=True, null=True)
    required = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.page.name} - {self.label}"


class FieldOption(models.Model):
    """Options for radio, checkbox, or dropdown fields."""
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='options')
    value = models.CharField(max_length=100)
    label = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Field Option"
        verbose_name_plural = "Field Options"

    def __str__(self):
        return f"{self.field.label} -> {self.label}"
