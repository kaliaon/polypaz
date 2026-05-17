from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    FriendSearchView,
    FriendRequestView,
    FriendAcceptView,
    FriendListView,
    FriendPendingView,
)

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Friends
    path('friends/', FriendListView.as_view(), name='friend-list'),
    path('friends/search/', FriendSearchView.as_view(), name='friend-search'),
    path('friends/request/', FriendRequestView.as_view(), name='friend-request'),
    path('friends/pending/', FriendPendingView.as_view(), name='friend-pending'),
    path('friends/<int:pk>/accept/', FriendAcceptView.as_view(), name='friend-accept'),
]
