# notes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, TeamViewSet, InvitationViewSet, UserProfileView, UserListView, CategoryViewSet

router = DefaultRouter()

router.register(r'teams', TeamViewSet)
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'invitations', InvitationViewSet)
router.register(r'categories', CategoryViewSet, basename='category')

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('', include(router.urls)),
]
