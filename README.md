Introduction
============

urbangraph is a web-based visualization program for urbansim indicator data.
It has a server-side component that collects urbansim indicators into a
database and serves them up with a RESTful API.  It has a reference web client
that can be used for inspecting the indicator results.

Setting Up Your Development Machine
===================================

Ubuntu
------

1. Install postgres, python, and virtualenv:

   $ sudo apt-get install postgresql python python-virtualenv

2. Check out the urbangraph code and cd into the directory

3. Set up your python virtualenv:

   $ virtualenv venv --distribute
   $ source venv/bin/activate
   $ pip install
   $ pip install -r requirements.txt

4. Create the urbangraph database:

   $ sudo su postgres
   $ createuser -P -d -l -R -S urbangraph
   $ createdb -O urbangraph urbangraph
   $ exit

   [ NOTE: the user needs to be able to create DBs to run the tests]

5. Sync the django app's db and launch the development server

   $ export DATABASE_URL=postgres://urbangraph:<password>@localhost/urbangraph
   $ python manage.py syncdb
   $ python manage.py runserver

6. Point your browser at the development server and expect the front page to
   appear

   http://localhost:8000/

7. Run the tests:

   $ python manage.py test

Deploying to Heroku
===================

1. Install heroku toolbelt.  This step varies depending on your platform.
   Here's how I do it on Ubuntu:

   $ wget -qO- https://toolbelt.heroku.com/install-ubuntu.sh | sh

2. Add heroku remote to your git tree:

   $ git remote add heroku git@heroku.com:urbangraph.git

3. Push to heroku and sync the db:

   $ git push heroku master
   $ heroku run python manage.py syncdb

4. Expect the updated app to be available here:

   http://urbangraph.herokuapp.com/

REST API
========

The following are descriptions of the resources served up by the REST API.  All
API calls are support only json input and output.  Authentication is not
supported at this time.  And only GET is supported.

NOTE: in many of the examples embedded in this documentation, the data for
title, description, etc., are null.  This reflects the fact that these
human-friendly fields are often not populated in any way by the underlying
system.  Eventually, this API will support updating these fields through POST
and PUT.

List of Projects
----------------
URI: /project

DESCRIPTION: This is the root resource.  When queried, it will return a list of
projects known to the system along with brief descriptions.

GET: Returns 200 along with the list of known projects.  Returns 204 and no
data if there are no known projects.  Here is an example of the expected
output:

    [
     {id: 1,
      name: 'bay_area_parcel',
      title: 'Bay Area Parcel-Level Model',
      description: 'A parcel-level model of the San Francisco Bay Area'
     },
     {id: 2,
      name: 'paris',
      title: 'Parcel-Level Model of Paris, France',
      description: null,
     }
    ]

Project
-------
URI: /project/<project_id>

DESCRIPTION: The project with id=<project_id>.

GET: Returns 200 along with the project data.  Returns 404 if there is no
project with id <project_id>.  The following is an example of the expected
output for project 1 at project/1:

    {
     id: 1,
     name: 'bay_area_parcel',
     title: 'Bay Area Parcel-Level Model',
     description: 'A parcel-level model of the San Francisco Bay Area'
    }

List of Scenarios
-----------------

URI: /project/<project_id>/scenario

DESCRIPTION: A scenario represents a policy specification used to project into
the future.  This resource is subordinate to the project.

GET: Returns 200 along with the list of scenarios.  Returns 204 and no data if
there are no specified scenarios.  Here is an example of the expected output:

    [
     {
       id: 1,
       name: 'No_Project',
       title: 'No Project',
       description: 'This is the "business as usual" scenario'
     },
     {
       id: 2,
       name: 'Transit',
       title: 'Transit Investment',
       description: 'Focus real estate and infrastructure investment near transit stations.'
     }
    ]

Scenario
--------

URI: /project/<project_id>/scenario/<scenario_id>

DESCRIPTION: The scenario with id=<scenario_id>.

GET: Returns 200 along with the scenario data.  Returns 404 if there is no
scenario with id <scenario_id>.  The following is an example of the expected
output for project 1 at project/1/scenario/1:

     {
      id: 1,
      name: 'No_Project',
      title: 'No Project',
      description: 'This is the "business as usual" scenario',
     }

List of Runs
------------

URI: /project/<project_id>/run

DESCRIPTION: A run represents a specific simulation run of a project under a
certain scenario.  Runs differ as scenario specifications are tuned, input data
is cleaned up, etc.  Even though a run is, strictly speaking, subordinate to a
scenario, users typically will want to retrieve recent runs for a project
regardless of the scenario.

GET: Returns 200 along with the list of runs.  Returns 204 and no data if
there are no runs.  Here is an example of the expected output:

    [
     {
       id: 46,
       name: null,
       title: null,
       description: null,
       date: '12 Nov 2012 15:23',
       project: 1,
       scenario: 1
     }
     {
       id: 42,
       name: null,
       title: null,
       description: null,
       date: '10 Nov 2012 09:18',
       project: 1,
       scenario: 2
     }
     {
       id: 19,
       name: null,
       title: null,
       description: null,
       date: '04 Nov 2012 01:42',
       project: 1,
       scenario: 1
     }
    ]

Run
---

URI: /project/<project_id>/run/<run_id>

DESCRIPTION: The run with id <run_id>

GET: Returns 200 along with the run data or 404.  Here's the sample output for
/project/1/run/46

    {
     id: 46,
     name: null,
     title: null,
     description: null,
     date: '12 Nov 2012 15:23',
     project: 1,
     scenario: 1
    }

List of Indicators
------------------

URI: /indicator

DESCRIPTION: Indicators are the output specifications of the simulation model.
They are typically aggregated numbers like population, employment, residential
units, etc.  They are aggregated to a certain zoom level such as the region,
county, superdistrict, zone, or parcel.  The list of indicators is usually
scoped with the keywords variable to reduce the size of the list.  Rarely will
uses want to view a whole list of all indicators defined in the system.
Indicators are also usually calculated over time, but this is not a
requirement.

GET: Returns 200 along with the list of indicators.  Here's some example output
for /indicator?keywords=population:

    [
     {
      id: 14,
      name: population,
      title: Population,
      description: null,
      x_label: year
     },
     {
      id: 93,
      name: gq_pop,
      title: Group Quarter Population,
      description: null,
      x_label: year
     },
    ]

Indicator
---------

URI: /indicator/<indicator_id>

DESCRIPTION: The indicator with id <indicator_id>

GET: Returns 200 along with the run data or 404.  Here's the sample output for
/indicator/14

    {
     id: 14,
     name: population,
     title: Population over Time,
     description: null,
     x_label: year
    },

List of Indicator Data
----------------------

URI: /project/<project_id>/run/<run_id>/indicator/

DESCRIPTION: Same as /indicators but only lists the indicators available for
the run with id=<run_id>.

Indicator Data
--------------

URI: /project/<project_id>/run/<run_id>/indicator/<indicator_id>

DESCRIPTION: Actual indicator data for the indicator with
indicator_id=<indicator_id>.  The default zoom level is county.  Here's some
sample output for the population indicator:

    {
     indicator_id: 14,
     name: population,
     title: Population over Time,
     description: null,
     level: 'county',
     run_id: 46,
     x: [2011, 2012, 2013, 2014, 2015]
     y: [
         {
          level_id: 10,
          name: 'alameda',
          title: 'Alameda County',
          data: [1485369, 1485369, 1495231, 1519193, 1534378],
         }
         {
          level_id: 19,
          name: 'contra costa',
          title: 'Contra Costa County',
          data: [1056021, 1044368, 1064472, 1063218, 1086880],
         }
        ]
    }
