from django.conf.urls import patterns, include, url
from django.conf.urls.defaults import *
from urbangraph.api import *
from tastypie.api import Api

v1_api = Api(api_name='v1')
v1_api.register(ScenarioResource())
v1_api.register(ProjectResource())
v1_api.register(RunResource())
v1_api.register(IndicatorResource())
v1_api.register(IndicatorDataResource())
v1_api.register(IndicatorYDataResource())

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'urbangraph.views.home', name='home'),
    # url(r'^urbangraph/', include('urbangraph.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    (r'^api/', include(v1_api.urls)),
)
