from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2", "first_name", "last_name")

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords must match."})
        # run Django's password validators
        validate_password(attrs.get("password"), user=User(username=attrs.get("username"), email=attrs.get("email")))
        return attrs

    def create(self, validated_data):
        # Remove fields that are not part of the User model
        validated_data.pop("password2", None)
        password = validated_data.pop("password")

        # Only keep fields that exist on User model to avoid unexpected kwargs
        allowed = {"username", "email", "first_name", "last_name"}
        user_data = {k: v for k, v in validated_data.items() if k in allowed}

        user = User(**user_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name")
