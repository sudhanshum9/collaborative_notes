# notes/serializers.py
from rest_framework import serializers
from .models import Note, Team, Invitation, Category
from django.contrib.auth import get_user_model

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'user']
        read_only_fields = ['user']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'user', 'title', 'content', 'category', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    """Serializer to represent User data in team members."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class TeamSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)  # Nested representation of team members

    class Meta:
        model = Team
        fields = ['id', 'name', 'members']
        
        

class InvitationSerializer(serializers.ModelSerializer):
    invited_by = UserSerializer(read_only=True)
    team = serializers.StringRelatedField()  # Shows the team name as a string

    class Meta:
        model = Invitation
        fields = ['id', 'email', 'team', 'invited_by', 'accepted']