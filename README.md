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
