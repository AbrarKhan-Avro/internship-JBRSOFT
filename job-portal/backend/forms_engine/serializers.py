from rest_framework import serializers
from .models import Page, Field, FieldOption


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
