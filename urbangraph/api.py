from tastypie.resources import ModelResource, Resource
from tastypie import fields
from urbangraph.models import *
from django.conf.urls import url
from tastypie.utils import trailing_slash
from tastypie.constants import ALL_WITH_RELATIONS, ALL

class ScenarioResource(ModelResource):
    project = fields.ToOneField('urbangraph.api.ProjectResource', 'project')
    class Meta:
        queryset = Scenario.objects.all()
        resource_name = 'scenario'

class IndicatorResource(ModelResource):
    class Meta:
        queryset = Indicator.objects.all()
        resource_name = 'indicator'
        filtering = {
            "name": ALL,
            }

class IndicatorYDataResource(ModelResource):
    class Meta:
        queryset = IndicatorYData.objects.all()
        resource_name = 'indicatorydata'

    def dehydrate(self, bundle):
        # We store the data a VARCHAR, but we want an array.  Hack.
        bundle.data['data'] = eval(bundle.data['data'])
        return bundle

class IndicatorDataResource(ModelResource):
    indicator = fields.ToOneField(IndicatorResource, 'indicator', full=True)
    yvalues = fields.ToManyField(IndicatorYDataResource, 'yvalues', full=True)
    run = fields.ToOneField('urbangraph.api.RunResource', 'run')
    class Meta:
        queryset = IndicatorData.objects.all()
        resource_name = 'indicatordata'
        filtering = {
            "run": ('exact',),
            "indicator": ALL_WITH_RELATIONS,
        }

    def dehydrate(self, bundle):
        # We store the xvalues a VARCHAR, but we want an array.  Hack.
        bundle.data['xvalues'] = eval(bundle.data['xvalues'])
        return bundle

class RunResource(ModelResource):
    project = fields.ToOneField('urbangraph.api.ProjectResource', 'project')
    scenario = fields.ToOneField(ScenarioResource, 'scenario', full=True)

    class Meta:
        queryset = Run.objects.all()
        resource_name = 'run'

    def override_urls(self):
        return [
            url(r'^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/indicator%s$' % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_indicator'),
                name='api_project_run_indicator'),
            url(r'^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/indicator/(?P<indicator_id>\w[\w/-]*)%s$' % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_indicatordata'),
                name='api_project_run_indicatordata'),
        ]

    def dispatch_indicator(self, request, **kwargs):
        return IndicatorResource().dispatch('list', request, **kwargs)

    def dispatch_indicatordata(self, request, **kwargs):
        #TODO: this should return the indicator data
        del kwargs['pk']
        return IndicatorDataResource().dispatch('detail', request, **kwargs)

class ProjectResource(ModelResource):

    class Meta:
        queryset = Project.objects.all()
        resource_name = 'project'

    def override_urls(self):
        return [
            url(r'^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/scenario%s$' % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_scenario'),
                name='api_project_scenario'),
            url(r'^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/run%s$' % (
                self._meta.resource_name, trailing_slash()),
                self.wrap_view('dispatch_run'),
                name='api_project_run'),
        ]

    def dispatch_scenario(self, request, **kwargs):
        return ScenarioResource().dispatch('list', request, **kwargs)

    def dispatch_run(self, request, **kwargs):
        return RunResource().dispatch('list', request, **kwargs)
