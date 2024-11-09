# notes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, TeamViewSet, InvitationViewSet, UserProfileView

router = DefaultRouter()

router.register(r'teams', TeamViewSet)
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'invitations', InvitationViewSet)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('', include(router.urls)),
]
