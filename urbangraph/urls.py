from django.conf.urls import patterns, include, url
from django.conf.urls.defaults import *
from urbangraph.api import ProjectResource

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

project_resource = ProjectResource()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'urbangraph.views.home', name='home'),
    # url(r'^urbangraph/', include('urbangraph.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
    (r'^api/', include(project_resource.urls)),
)
