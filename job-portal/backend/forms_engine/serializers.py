from rest_framework import serializers
from .models import Page, Field, FieldOption, FormSubmission


class FieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOption
        fields = ['id', 'value', 'label']


class FieldSerializer(serializers.ModelSerializer):
    options = FieldOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Field
        fields = [
            'id',
            'label',
            'name',
            'field_type',
            'placeholder',
            'default_value',
            'required',
            'order',
            'options'
        ]


class PageSerializer(serializers.ModelSerializer):
    fields = FieldSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = ['id', 'name', 'slug', 'description', 'fields']


class FormSubmissionSerializer(serializers.ModelSerializer):
    """
    Serializes form submissions stored as JSON for each Page.
    """
    page_name = serializers.CharField(source='page.name', read_only=True)
    page_slug = serializers.CharField(source='page.slug', read_only=True)

    class Meta:
        model = FormSubmission
        fields = ['id', 'page', 'page_name', 'page_slug', 'data', 'submitted_at']
        read_only_fields = ['id', 'submitted_at', 'page_name', 'page_slug']
