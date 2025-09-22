from django.contrib import admin
from .models import Page, Field, FieldOption, FormSubmission, SubmissionFile

class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1
    fields = ("label", "value", "order")


class FieldInline(admin.StackedInline):
    model = Field
    extra = 1
    fields = ("name", "label", "field_type", "placeholder", "default_value", "required", "order", "help_text", "validation")
    inlines = [FieldOptionInline]


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_active", "updated_at")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [FieldInline]
    search_fields = ("title", "slug")


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ("name", "page", "field_type", "required", "order")
    list_filter = ("page", "field_type")
    inlines = [FieldOptionInline]


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "page", "created_at")
    readonly_fields = ("data", "created_at", "ip_address", "meta")
    search_fields = ("data",)
    list_filter = ("page",)


@admin.register(SubmissionFile)
class SubmissionFileAdmin(admin.ModelAdmin):
    list_display = ("submission", "field_name", "file", "uploaded_at")
