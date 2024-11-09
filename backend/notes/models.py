# notes/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Note(models.Model):
    user = models.ForeignKey(User, related_name="notes", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Team(models.Model):
    name = models.CharField(max_length=100)
    members = models.ManyToManyField(User, related_name="teams")

    def __str__(self):
        return self.name

class Invitation(models.Model):
    email = models.EmailField()
    team = models.ForeignKey(Team, related_name="invitations", on_delete=models.CASCADE)
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE)
    accepted = models.BooleanField(default=False)

    def __str__(self):
        return f"Invite {self.email} to {self.team.name}"