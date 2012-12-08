#!/usr/bin/python
import urllib2
import sys
import json
from urbangraph.models import *
import django
from bs4 import BeautifulSoup
import re
import csv
from django.db import transaction

HUDSON_OPUS_HOME = '/var/hudson/workspace/MTC_Model'
HUDSON_PROJECT = 'bay_area_parcel'
OPUS_REST_URL = 'http://paris.urbansim.org/opus/rest'
INDICATOR_URL = 'http://paris.urbansim.org/MTC_Model'

# The county info is not hosted anywhere.  So we hardcode it.
id_to_county = {
    1: "Alameda",
    7: "Contra Costa",
    21: "Marin",
    38: "San Francisco",
    28: "Napa",
    41: "San Mateo",
    48: "Solano",
    49: "Sonoma",
    43: "Santa Clara",
}

@transaction.commit_manually
def add_run_to_db(run_data):
    #cache_directory = j['cache_directory']
    #host = j['hudson_details']['node']

    # the top-level object is a project
    project = Project.objects.get_or_create(name=run_data['project_name'])[0]

    # Then there's the scenario.  Note that we use an automation framework
    # called hudson to run these.  And the suffix _hudson is added to the
    # scenarios as part of this.  But this is meaningless for our purposes.
    scenario_name = run_data['scenario_name'].replace('_hudson', '')
    scenario = Scenario.objects.get_or_create(name=scenario_name,
                                              project=project)[0]

    # And the run data
    run_id = int(run_data['run_id'])
    run = Run.objects.get_or_create(id=run_id, scenario=scenario, project=project)[0]

    # Go fetch the pre-computed indicators.  This requires some scraping.
    try:
        url = INDICATOR_URL + '/' + scenario_name + '/run_' + str(run_id) + \
              '/indicators'
        f = urllib2.urlopen(url)
    except urllib2.HTTPError as e:
        print "WARNING: No precomputed indicators available for run " + \
              str(run_id)
        return
    soup = BeautifulSoup(f)
    links = filter(lambda l: l.endswith('.tab'),
                   map(lambda a: a['href'], soup.find_all('a')))
    for l in links:
        m = re.search('(^[a-zA-Z0-9]+)_table-[0-9]_([0-9]+)-([0-9]+)_[a-z]+__([a-zA-Z0-9_]+)\.tab$', l)
        if not m:
            print "WARNING: skipping unparsable indicator file", l
            continue
        lname = m.group(1)
        year_begin = int(m.group(2))
        year_end = int(m.group(3))
        iname = m.group(4).split('_')
        if iname[0] == lname:
            iname = iname[1:]
        iname = '_'.join(iname)

        if lname == "area" or lname == "pda":
            # area and pda are different sorts of geography that we're ont
            # working with at this time.  They also do not match our data
            # model.  So we ignore them.
            continue

        if lname == "alldata":
            # alldata is a very undescriptive name.  So we call it region
            # instead.
            lname = "region"
        level = Level.objects.get_or_create(name=lname)[0]

        indicator = Indicator.objects.get_or_create(name=iname)[0]

        # Check if we already have indicators for this run.
        n = IndicatorData.objects.filter(run_id=run.id, indicator=indicator,
                                         shape__level__name__exact=lname).count()
        if n > 0:
            print "Already have", lname, iname, "for run", str(run_id)
            continue

        # Now we actually fetch the data
        print "Fetching", lname, iname, "for run", str(run_id)
        d = urllib2.urlopen(url + '/' + l)
        reader = csv.reader(d, delimiter='\t')
        header = True
        for row in reader:
            # all of the data in our case is id,t,t+1,t+2... with a header that
            # we ignore
            if header:
                header = False
                continue

            # find the associated shape
            sname = lname + '_' + row[0]
            if lname == "county":
                try:
                    sname = id_to_county[int(row[0])]
                except KeyError:
                    # skip rows with unknown counties.
                    continue
            shape = Shape.objects.filter(level_id=level.id, name__iexact=sname)
            if not shape:
                print "WARNING: Failed to find shape",sname,"at level",lname,"for",iname
                break
            shape = shape[0]
            map(lambda i: IndicatorData(run=run, shape=shape,
                                        indicator=indicator,
                                        xvalue=float(i[0]),
                                        yvalue=float(i[1])).save(),
                zip(range(year_begin, year_end+1), row[1:]))
        transaction.commit()

def add_run_to_json(run_data):
    index = open('testdata/index.json', 'w');
    index.write('[');
    project_name = run_data['project_name']
    scenario_name = run_data['scenario_name'].replace('_hudson', '')
    run_id = int(run_data['run_id'])

    # Go fetch the pre-computed indicators.  This requires some scraping.
    try:
        url = INDICATOR_URL + '/' + scenario_name + '/run_' + str(run_id) + \
              '/indicators'
        f = urllib2.urlopen(url)
    except urllib2.HTTPError as e:
        print "WARNING: No precomputed indicators available for run " + \
              str(run_id)
        return
    soup = BeautifulSoup(f)
    links = filter(lambda l: l.endswith('.tab'),
                   map(lambda a: a['href'], soup.find_all('a')))
    first = True
    for l in links:
        m = re.search('(^[a-zA-Z0-9]+)_table-[0-9]_([0-9]+)-([0-9]+)_[a-z]+__([a-zA-Z0-9_]+)\.tab$', l)
        if not m:
            print "WARNING: skipping unparsable indicator file", l
            continue
        lname = m.group(1)

        year_begin = int(m.group(2))
        year_end = int(m.group(3))
        iname = m.group(4).split('_')
        if iname[0] == lname:
            iname = iname[1:]
        iname = '_'.join(iname)

        # For now, just do county
        if lname != 'county':
            continue

        j = {}
        j['project_name'] = project_name
        j['scenario_name'] = scenario_name
        j['run_id'] = run_id
        j['name'] = iname
        j['xlabel'] = 'Year'
        j['ylabel'] = iname

        if lname == "area" or lname == "pda":
            # area and pda are different sorts of geography that we're ont
            # working with at this time.  They also do not match our data
            # model.  So we ignore them.
            continue

        if lname == "alldata":
            # alldata is a very undescriptive name.  So we call it region
            # instead.
            lname = "region"

        j['level'] = lname

        # create a dumb url
        filename = 'testdata/' + '_'.join([project_name, iname, str(run_id), lname]) + '.json'
        j['url'] = '../' + filename
        f = open(filename, 'w')

        # Add to the index
        output = json.dumps(j, sort_keys=True, indent=2, separators=(',', ': '))
        if not first:
            output = ',\n' + output
        first = False
        index.write(output)

        # Now we actually fetch the data
        j['xvalues'] = range(year_begin, year_end+1)
        j['yvalues'] = []

        print "Fetching", lname, iname, "for run", str(run_id)
        d = urllib2.urlopen(url + '/' + l)
        reader = csv.reader(d, delimiter='\t')
        header = True
        for row in reader:
            # all of the data in our case is id,t,t+1,t+2... with a header that
            # we ignore
            if header:
                header = False
                continue

            # find the associated shape
            sname = lname + '_' + row[0]
            if lname == "county":
                try:
                    sname = id_to_county[int(row[0])]
                except KeyError:
                    # skip rows with unknown counties.
                    continue
            yval = {'name': sname}
            yval['data'] = map(lambda x: float(x), row[1:])
            j['yvalues'].append(yval)
        f.write(json.dumps(j, sort_keys=True, indent=2, separators=(',', ': ')))
        f.close()

    index.write(']\n');
    index.close();

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print "Usage: get_run.py <run_id>"
        sys.exit(1)
    run = sys.argv[1]

    # Start by getting the project data
    try:
        f = urllib2.urlopen(OPUS_REST_URL + '/' + run)
    except urllib2.HTTPError as e:
        if e.code == 404:
            print 'Run ' + run + ' does not appear to exist'
        elif e.code >= 500:
            print 'Yikes!  The opus rest server failed for some reason!'
        sys.exit(1)

    run_data = json.loads(f.read())
    #add_run_to_db(run_data)
    add_run_to_json(run_data)
