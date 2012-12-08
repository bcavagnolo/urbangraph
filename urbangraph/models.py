from django.contrib.gis.db import models
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
    parent = models.ForeignKey('self',null=True, blank=True)

    def __unicode__(self):
        return self.name

class Shape(models.Model):
    level = models.ForeignKey(Level)
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=256, null=True)

    # geo django fields
    poly = models.MultiPolygonField(srid=3740)
    objects = models.GeoManager()

    def __unicode__(self):
        return self.name

class Scenario(models.Model):
    name = models.CharField(max_length=200)
    project = models.ForeignKey(Project)
    description = models.TextField()

class Run(models.Model):
    id = models.IntegerField(unique=True, primary_key=True)
    project = models.ForeignKey(Project)
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
    xvalue = models.FloatField()
    yvalue = models.FloatField()

    class Meta:
        unique_together = ("run", "shape", "indicator", "xvalue")

    def __unicode__(self):
        return str(self.xvalue) + ',' + str(self.yvalue)
    

