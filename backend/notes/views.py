# notes/views.py
from rest_framework import views, viewsets, status, permissions
from rest_framework.permissions import IsAuthenticated
from .models import Note, Team, Category
from .serializers import NoteSerializer, CategorySerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


from django.db.models import Q
from .models import Team, Invitation
from .serializers import TeamSerializer, InvitationSerializer


from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer  # Assuming you have a user serializer

User = get_user_model()

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer 
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Filter notes the user owns, or is shared with their teams, or shared with them directly
        return Note.objects.filter(
            Q(user=user) |
            Q(shared_with_teams__in=user.teams.all()) |
            Q(shared_with_users=user)
        ).distinct()
        
    def update(self, request, *args, **kwargs):
        note = self.get_object()
        
        # Handle category creation/assignment
        category_name = request.data.get('category')
        if category_name:
            category, created = Category.objects.get_or_create(
                name=category_name,
                user=request.user
            )
            request.data['category'] = category.id
            
        serializer = self.get_serializer(note, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Get the updated note data
        updated_note = serializer.data

        # Broadcast the updated note data via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "notes_room",  # Group name used in the consumer
            {
                "type": "update",  # Changed from note.update to note_update to match consumer
                "id": updated_note["id"],
                "title": updated_note["title"],
                "content": updated_note["content"],
            }
        ) 
        print("Broadcasted note update to notes_room:", updated_note)

        return Response(updated_note, status=status.HTTP_200_OK)
    
    def perform_create(self, serializer):
        """
        Creates a new note with the following flow:
        1. Gets category name from request data if provided
        2. If category exists, gets it from DB, otherwise creates new one
        3. Saves note with the user and category (if provided)
        """
        # Get category name from request data
        category_id = self.request.data.get('category')
        
        if category_id:
            # Get or create category for the user
            category, created = Category.objects.get_or_create(
                id=category_id,
                user=self.request.user
            )
            # Save note with user and category
            serializer.save(user=self.request.user, category=category)
        else:
            # Save note with just the user if no category provided
            serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def share_with_team(self, request, pk=None):
        note = self.get_object()
        team_id = request.data.get('team_id')
        try:
            team = Team.objects.get(id=team_id)
            note.shared_with_teams.add(team)
            return Response({"message": f"Note shared with team {team.name}"}, status=status.HTTP_200_OK)
        except Team.DoesNotExist:
            return Response({"error": "Team not found"}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['post'])
    def share_with_user(self, request, pk=None):
        note = self.get_object()
        user_id = request.data.get('user_id')
        try:
            user = User.objects.get(id=user_id)
            note.shared_with_users.add(user)
            return Response({"message": f"Note shared with user {user.username}"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Return only the teams the current user is a member of
        return Team.objects.filter(members=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Get the team name from the request data
        name = request.data.get('name')
        
        # Check if the team name is provided
        if not name:
            return Response({"error": "Team name is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new team and add the requesting user as a member
        team = Team.objects.create(name=name)
        team.members.add(request.user)

        serializer = TeamSerializer(team)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        team = self.get_object()
        email = request.data.get('email')

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Check if an invitation already exists for this email and team
        if Invitation.objects.filter(email=email, team=team, accepted=False).exists():
            return Response({"message": "Invitation already sent to this email"}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new invitation
        invitation = Invitation.objects.create(team=team, invited_by=request.user, email=email)
        serializer = InvitationSerializer(invitation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only invitations for the current user's email
        return Invitation.objects.filter(email=self.request.user.email, accepted=False)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invitation = self.get_object()
        
        # Check if the invitation has already been accepted
        if invitation.accepted:
            return Response({"message": "Invitation already accepted"}, status=status.HTTP_400_BAD_REQUEST)

        # Add the user to the team
        team = invitation.team
        team.members.add(request.user)
        # Mark the invitation as accepted
        invitation.accepted = True
        invitation.save()
        
        return Response({"message": "Invitation accepted and user added to the team"}, status=status.HTTP_200_OK)