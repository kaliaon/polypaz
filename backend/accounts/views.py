from django.contrib.auth import authenticate, login, logout
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, RegisterSerializer, LoginSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        # Debug logging
        print(f"DEBUG REGISTER: Request method: {request.method}")
        print(f"DEBUG REGISTER: Request headers: {request.headers}")
        print(f"DEBUG REGISTER: Request data: {request.data}")

        try:
            # Standard create logic
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            # Generate tokens for the new user
            refresh = RefreshToken.for_user(user)

            # Return response with tokens matching AuthService expectation
            return Response({
                "user": UserSerializer(user).data,
                "message": "Registration Successful",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"DEBUG REGISTER: Exception occurred: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        # Debug logging
        print(f"DEBUG: Request method: {request.method}")
        print(f"DEBUG: Request headers: {request.headers}")
        print(f"DEBUG: Request data: {request.data}")
        print(f"DEBUG: Content-Type: {request.content_type}")

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "user": UserSerializer(user).data,
                    "message": "Login Successful",
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token)
                    }
                })
            return Response({"message": "Invalid username or password"}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Successfully logged out"})


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Update user profile with language preferences"""
        user = self.get_object()
        profile_data = request.data.get('profile', {})

        # Update profile fields if provided
        if profile_data:
            # Create profile if it doesn't exist
            if not hasattr(user, 'profile'):
                from .models import UserProfile
                UserProfile.objects.create(user=user)

            profile = user.profile
            if 'target_language' in profile_data:
                profile.target_language = profile_data['target_language']
            if 'native_language' in profile_data:
                profile.native_language = profile_data['native_language']
            if 'learning_preferences' in profile_data:
                profile.learning_preferences = profile_data['learning_preferences']
            profile.save()

        return Response(UserSerializer(user).data) 