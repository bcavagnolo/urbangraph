Introduction
============

urbangraph is a web-based visualization program for urbansim indicator data.
It has a server-side component that collects urbansim indicators into a
database and serves them up with a RESTful API.  It has a reference web client
that can be used for inspecting the indicator results.

REST API
========

The following are descriptions of the resources served up by the REST API.  All
API calls are support only json input and output.  Authentication is not
supported.

List of Projects
----------------
URI: /

DESCRIPTION: This is the root resource.  When queried, it will return a list of
projects known to the system along with brief descriptions.

GET: Returns 200 along with the list of known projects.  Returns 204 and no
data if there are no known projects.  Here is an example of the expected
output:

[{id: 1,
  name: 'bay_area_parcel',
  title: 'Bay Area Parcel-Level Model',
  description: 'A parcel-level model of the San Francisco Bay Area'
 },
 {id: 2,
  name: 'paris',
  title: 'Parcel-Level Model of Paris, France',
  description: null,
 }]

[MORE TO COME]
