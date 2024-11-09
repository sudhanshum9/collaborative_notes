from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'  # Set email as the unique identifier
    REQUIRED_FIELDS = ['username']  # Ensure username is required


User = get_user_model()

# class Team(models.Model):
#     owner = models.ForeignKey(User, related_name="owned_teams", on_delete=models.CASCADE)
#     members = models.ManyToManyField(User, related_name="teams")
#     name = models.CharField(max_length=100)