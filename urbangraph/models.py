from django.db import models
from django.core.validators import validate_slug

class Project(models.Model):
    name = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(validators=[validate_slug])
