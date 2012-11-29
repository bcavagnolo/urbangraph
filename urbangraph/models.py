from django.db import models
from django.core.validators import validate_slug

class Project(models.Model):
    name = models.CharField(max_length=255, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(validators=[validate_slug])
	class Meta:
		db_table = 'Project'

class level(models.Model):
    name = models.CharField(max_length=200)    
    class Meta:
        db_table = 'leveltb'
    def __unicode__(self):
        return self.name

class shapeobj(models.Model):
    levelfk = models.ForeignKey(level)
    name = models.CharField(max_length=200)
    parent_id = models.ForeignKey('self',null=True, blank=True)
    class Meta:
        db_table = 'shapetb'
    def __unicode__(self):
        return self.name
        
class runs(models.Model):
    name = models.CharField(max_length=200)
    class Meta:
        db_table = 'runstb'

class indicator(models.Model):
    name = models.CharField(max_length=200)
    desc = models.CharField(max_length=200)
    class Meta:
        db_table = 'indicatortb'    
    def __unicode__(self):
        return self.name
    
class indicatordata(models.Model):
    runfk = models.ForeignKey(runs)
    shapefk = models.ForeignKey(shapeobj)
    indicatorfk = models.ForeignKey(indicator)
    xvalue = models.CharField(max_length=100)
    yvalue = models.CharField(max_length=100)
    class Meta:
        db_table = 'indicatordatatb'
    def __unicode__(self):
        return self.runfk
    

