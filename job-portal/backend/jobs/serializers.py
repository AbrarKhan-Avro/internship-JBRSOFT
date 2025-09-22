# backend/jobs/serializers.py
from rest_framework import serializers
from .models import Page, Field, FieldOption, FormSubmission, SubmissionFile
import re

# Simple option serializer
class FieldOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldOption
        fields = ("id", "label", "value", "order")

# Field serializer includes its options
class FieldSerializer(serializers.ModelSerializer):
    options = FieldOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Field
        fields = (
            "id",
            "name",
            "label",
            "field_type",
            "placeholder",
            "default_value",
            "required",
            "order",
            "help_text",
            "validation",
            "options",
        )

# Page serializer includes all fields
class PageSerializer(serializers.ModelSerializer):
    fields = FieldSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = ("id", "title", "slug", "description", "is_active", "fields")


# For returning a saved submission
class SubmissionFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubmissionFile
        fields = ("id", "field_name", "file", "uploaded_at")

class FormSubmissionSerializer(serializers.ModelSerializer):
    # ✅ Removed 'source="files"' to fix 500 error
    files = SubmissionFileSerializer(many=True, read_only=True)

    class Meta:
        model = FormSubmission
        fields = ("id", "page", "data", "created_at", "ip_address", "meta", "files")
        read_only_fields = ("created_at", "id", "files")


# ===== Dynamic submission validator =====
class DynamicFormSubmissionSerializer(serializers.Serializer):
    """
    Validates incoming form submission based on the Page and its Fields.
    - The view must pass 'page' in the serializer context.
    - Files are validated in the view and passed via context['files'] if needed.
    """

    def to_internal_value(self, data):
        # accept raw request data (QueryDict or dict)
        return data

    def validate(self, attrs):
        request_data = self.initial_data  # may be QueryDict (multipart)
        page: Page = self.context.get("page")
        files_by_field = self.context.get("files", {})

        errors = {}
        cleaned = {}

        for field in page.fields.all():
            key = field.name

            # -------- handle file fields --------
            if field.field_type == "file":
                uploaded_files = files_by_field.get(key, [])
                if field.required and not uploaded_files:
                    errors[key] = ["This file field is required."]
                else:
                    # store list of filenames for now (actual files saved in view)
                    cleaned[key] = [f.name for f in uploaded_files] if uploaded_files else []
                continue

            # -------- handle multiple-choice checkboxes --------
            if field.field_type == "checkboxes":
                if hasattr(request_data, "getlist"):
                    vals = request_data.getlist(key)
                else:
                    vals = request_data.get(key) or []
                    if isinstance(vals, str):
                        vals = [vals]
                if field.required and not vals:
                    errors[key] = ["This field is required."]
                else:
                    option_values = [opt.value for opt in field.options.all()]
                    invalid = [v for v in vals if option_values and v not in option_values]
                    if invalid:
                        errors[key] = [f"Invalid choice(s): {invalid}"]
                    else:
                        cleaned[key] = vals
                continue

            # -------- single-value fields --------
            raw = request_data.get(key) if not hasattr(request_data, "getlist") else request_data.get(key)

            if field.required and (raw is None or raw == ""):
                errors[key] = ["This field is required."]
                continue

            if raw is None:
                cleaned[key] = None
                continue

            # email validation
            if field.field_type == "email":
                if not re.match(r"[^@]+@[^@]+\.[^@]+", str(raw)):
                    errors[key] = ["Enter a valid email address."]
                else:
                    cleaned[key] = str(raw)
                continue

            # number validation
            if field.field_type == "number":
                try:
                    num = float(raw) if "." in str(raw) else int(raw)
                    v_rules = field.validation or {}
                    min_v = v_rules.get("min")
                    max_v = v_rules.get("max")
                    if min_v is not None and num < min_v:
                        errors[key] = [f"Value must be >= {min_v}"]
                    elif max_v is not None and num > max_v:
                        errors[key] = [f"Value must be <= {max_v}"]
                    else:
                        cleaned[key] = num
                except Exception:
                    errors[key] = ["Enter a valid number."]
                continue

            # select/radio choice validation
            if field.field_type in ("select", "radio"):
                option_values = [opt.value for opt in field.options.all()]
                if option_values and str(raw) not in option_values:
                    errors[key] = ["Invalid choice."]
                else:
                    cleaned[key] = raw
                continue

            # default: store as string (text, textarea, password, date, hidden)
            v_rules = field.validation or {}
            min_len = v_rules.get("min_length")
            max_len = v_rules.get("max_length")
            s = str(raw)
            if min_len is not None and len(s) < min_len:
                errors[key] = [f"Minimum length is {min_len}"]
            elif max_len is not None and len(s) > max_len:
                errors[key] = [f"Maximum length is {max_len}"]
            else:
                cleaned[key] = s

        if errors:
            raise serializers.ValidationError(errors)

        return {"cleaned_data": cleaned}
