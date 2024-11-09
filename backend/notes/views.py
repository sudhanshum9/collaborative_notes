# notes/views.py
from rest_framework import views, viewsets, status
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model


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


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
        # Return only invitations for the current user’s email
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