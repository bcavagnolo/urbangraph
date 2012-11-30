from django.db import models
from django.core.validators import validate_slug

class Project(models.Model):
    name = models.CharField(max_length=255, unique=True,
                            validators=[validate_slug])
    title = models.CharField(max_length=255)
    description = models.TextField()

    def __unicode__(self):
        return self.name

class Level(models.Model):
    name = models.CharField(max_length=200)    

    def __unicode__(self):
        return self.name

class Shape(models.Model):
    level = models.ForeignKey(Level)
    name = models.CharField(max_length=200)
    parent = models.ForeignKey('self',null=True, blank=True)

    def __unicode__(self):
        return self.name

class Scenario(models.Model):
    name = models.CharField(max_length=200)
    project = models.ForeignKey(Project)
    description = models.TextField()

class Run(models.Model):
    name = models.CharField(max_length=200)
    scenario = models.ForeignKey(Scenario)

class Indicator(models.Model):
    name = models.CharField(max_length=200)
    desc = models.CharField(max_length=200)

    def __unicode__(self):
        return self.name

class IndicatorData(models.Model):
    run = models.ForeignKey(Run)
    shape = models.ForeignKey(Shape)
    indicator = models.ForeignKey(Indicator)
    xvalue = models.CharField(max_length=100)
    yvalue = models.CharField(max_length=100)

    def __unicode__(self):
        return self.runfk
    

