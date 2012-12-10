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
    parent = models.ForeignKey('self',null=True, blank=True)

    def __unicode__(self):
        return self.name

class Shape(models.Model):
    level = models.ForeignKey(Level)
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=256, null=True)

    # geo django fields
    # Due to time constraints, we're not using postgis yet.
    # poly = models.MultiPolygonField(srid=3740)
    # objects = models.GeoManager()

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

class IndicatorYData(models.Model):
    name = models.CharField(max_length=128)
    data = models.CharField(max_length=2048)

    def __unicode__(self):
        return str(self.xvalue) + ',' + str(self.yvalue)

class IndicatorData(models.Model):
    run = models.ForeignKey(Run)
    # For now we are only representing the county level.
    #shape = models.ForeignKey(Shape)
    indicator = models.ForeignKey(Indicator)
    # We really want a float array here.  And this exists in postgres.  In
    # fact, the dbarray project adds this type to the ORM.  But there's no
    # corresponding tastypie resource field.  So we're using varchar.  We use
    # 20 characters for each number and its comma.  The most numbers we have is
    # [2010-2040] = 31.  And we need the array brackets.  So the max length of
    # the field is 20*31 + 2 = 622.  And the xvals can be shorter.  5*31 + 2 =
    # 157.
    xvalues = models.CharField(max_length=160)
    yvalues = models.ManyToManyField(IndicatorYData)

    class Meta:
        unique_together = ("run", "indicator")

