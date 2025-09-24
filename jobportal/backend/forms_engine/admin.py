from django.contrib import admin
from .models import Page, Field, FieldOption, FormSubmission

class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1

class FieldInline(admin.TabularInline):
    model = Field
    extra = 1

@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [FieldInline]

@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ("label", "page", "field_type", "order")
    list_filter = ("page", "field_type")
    inlines = [FieldOptionInline]

@admin.register(FieldOption)
class FieldOptionAdmin(admin.ModelAdmin):
    list_display = ("field", "label", "value")

@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ("page", "created_at")
    readonly_fields = ("data", "created_at")
