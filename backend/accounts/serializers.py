from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile model
    """
    class Meta:
        model = UserProfile
        fields = [
            'target_language',
            'native_language',
            'current_cefr_level',
            'learning_preferences',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class UserSerializer(serializers.ModelSerializer):
    """
    User serializer with embedded profile data
    """
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    # Profile fields
    target_language = serializers.ChoiceField(
        choices=UserProfile.LANGUAGE_CHOICES,
        required=False,
        write_only=True
    )
    native_language = serializers.ChoiceField(
        choices=UserProfile.LANGUAGE_CHOICES,
        required=False,
        write_only=True
    )

    class Meta:
        model = User
        fields = [
            'username', 'password', 'password2', 'email',
            'first_name', 'last_name', 'target_language', 'native_language'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Extract profile data
        target_language = validated_data.pop('target_language', None)
        native_language = validated_data.pop('native_language', 'english')
        validated_data.pop('password2')

        # Create user
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        user.set_password(validated_data['password'])
        user.save()

        # Update profile (created automatically by signal)
        if target_language:
            user.profile.target_language = target_language
        user.profile.native_language = native_language
        user.profile.save()

        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True) 