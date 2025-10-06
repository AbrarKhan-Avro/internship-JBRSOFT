from django.contrib import admin
from .models import Page, Field, FieldOption


class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1


class FieldInline(admin.TabularInline):
    model = Field
    extra = 1


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {"slug": ("name",)}
    inlines = [FieldInline]


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('label', 'field_type', 'page', 'required', 'order')
    list_filter = ('page', 'field_type')
    inlines = [FieldOptionInline]


@admin.register(FieldOption)
class FieldOptionAdmin(admin.ModelAdmin):
    list_display = ('label', 'value', 'field')
