from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Friendship
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    FriendUserSerializer,
    PendingFriendshipSerializer,
)


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
            if 'avatar' in profile_data:
                profile.avatar = profile_data['avatar']
            profile.save()

        return Response(UserSerializer(user).data)


def _friend_user_ids(user):
    """Return the set of user ids the given user is friends with (accepted)."""
    qs = Friendship.objects.filter(accepted=True).filter(
        Q(from_user=user) | Q(to_user=user)
    )
    ids = set()
    for fr in qs:
        ids.add(fr.to_user_id if fr.from_user_id == user.id else fr.from_user_id)
    return ids


class FriendSearchView(APIView):
    """
    GET /api/auth/friends/search/?q=<username>
    Search users by username substring (case-insensitive). Excludes the
    current user and is capped at 20 results.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = (request.query_params.get('q') or '').strip()
        if not q:
            return Response([], status=status.HTTP_200_OK)

        users = (
            User.objects
            .filter(username__icontains=q)
            .exclude(id=request.user.id)
            .select_related('profile')[:20]
        )
        serializer = FriendUserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)


class FriendRequestView(APIView):
    """
    POST /api/auth/friends/request/  body: {"user_id": <int>}
    Send a friend request to another user. If the other user already sent
    a pending request to you, accept it instead.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_id = request.data.get('user_id')
        if not target_id:
            return Response({"detail": "user_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        if int(target_id) == request.user.id:
            return Response({"detail": "Cannot add yourself."}, status=status.HTTP_400_BAD_REQUEST)

        target = get_object_or_404(User, pk=target_id)

        # If the target already requested us, accept their request
        incoming = Friendship.objects.filter(from_user=target, to_user=request.user).first()
        if incoming:
            if not incoming.accepted:
                incoming.accepted = True
                incoming.save()
            return Response({"status": "friends"}, status=status.HTTP_200_OK)

        fr, created = Friendship.objects.get_or_create(
            from_user=request.user,
            to_user=target,
        )
        return Response(
            {"status": "friends" if fr.accepted else "requested"},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class FriendAcceptView(APIView):
    """
    POST /api/auth/friends/<int:pk>/accept/
    Accept a pending friend request addressed to the current user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        fr = get_object_or_404(Friendship, pk=pk, to_user=request.user)
        if not fr.accepted:
            fr.accepted = True
            fr.save()
        return Response({"status": "friends"})


class FriendListView(APIView):
    """
    GET /api/auth/friends/
    List the current user's accepted friends.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        friend_ids = _friend_user_ids(request.user)
        friends = User.objects.filter(id__in=friend_ids).select_related('profile')
        serializer = FriendUserSerializer(friends, many=True, context={'request': request})
        return Response(serializer.data)


class FriendPendingView(APIView):
    """
    GET /api/auth/friends/pending/
    List pending incoming friend requests for the current user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pending = (
            Friendship.objects
            .filter(to_user=request.user, accepted=False)
            .select_related('from_user', 'from_user__profile')
        )
        serializer = PendingFriendshipSerializer(pending, many=True, context={'request': request})
        return Response(serializer.data)
