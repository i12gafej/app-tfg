#!/usr/bin/env python3

'''
./tests/docbook_validation/asciidoc3_docbook51_relaxng_validation.py
validation docbook51 relaxng

Tests all DocBook51-files produced with testasciidoc3.py found
in directory './tests/data' if valid against
relaxng_docbook51.
We are using the following five tools to validate:
- xmllint (Package libxml2-utils)
- xmlstarlet (Package xmlstarlet)
- lxml.de (Package python3-lxml)
- jing
- Sun's MSV
Check if present on command line with 'xmllint' and 'xmlstarlet' and
'jing' and with 'import lxml'.
You can disable the program that is not available, but it is recommended
to make use of more than one validator to make the test more reliable.

USAGE:
'python3 asciidoc3_docbook51_relaxng_validation.py'
to test all files ending with 'docbook51.xml' in directory './tests/data' or
'python3 asciidoc3_docbook51_relaxng_validation.py path/to/db51_xml_file.xml'
to validate just one file.

Copyright: (c) 2020 Berthold Gehrke <berthold.gehrke@gmail.com>
License:   GNU GPL v2 or higher
'''

from io import StringIO
import os
from pathlib import Path
import re
import subprocess
import sys
try:
    from lxml import etree
    LXMLPARSER = 'lxmlparser'
except ModuleNotFoundError:
    LXMLPARSER = ''

# External executables.
XMLLINT = 'xmllint'         # Set to '' to disable.
# XMLLINT = ''

XMLSTARLET = 'xmlstarlet'   # Set to '' to disable.
# XMLSTARLET = ''

JING = 'jing'   # Set to '' to disable.
# JING = ''

SUNMSV = 'sunmsv'   # Set to '' to disable.
# SUNMSV = ''

# LXMLPARSER = ''  # Uncomment to disable lmxlparser.


def xmllint_db51(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    subprocess.run(["xmllint", "--noout", "--relaxng",
                    full_path + "/rng-docbook51.rng", path_to_data + testfile])


def xmlstarlet_db51(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    subprocess.run(["xmlstarlet", "val", "--relaxng",
                    full_path + "/rng-docbook51.rng", path_to_data + testfile])


def jing_db51(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    print("jing: ")
    subprocess.run(["jing", full_path + "/rng-docbook51.rng",
                    path_to_data + testfile])


def sunmsv_db51(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    print("sunmsv: ")
    subprocess.run(["java", "-jar", full_path +
                    "/sun_msv_jar_files/relames-0.3.0.jar",
                    full_path + "/rng-docbook51.rng", path_to_data + testfile])


def lxml_db51(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    relaxng_new = etree.parse(full_path + "/rng-docbook51.rng")
    relaxng = etree.RelaxNG(relaxng_new)
    with open(path_to_data + testfile, 'r') as tfile:
        testdata = tfile.read()
        testdata, counter = re.subn(
            r'<\?xml version="1.0"(.*?)encoding="UTF-8"(.*?)\?>',
            r'<?xml version="1.0"\g<1>\g<2>?>', testdata, 1)
        assert counter == 1
        testdata = StringIO(testdata)
        t = etree.parse(testdata)
        relaxng.assertValid(t)
        result_exp = relaxng.validate(t)
        print("lxml.de validation against RelaxNG:  ", result_exp)


def main():
    if filepath:
        if XMLLINT:
            xmllint_db51(base_filepath)
        if XMLSTARLET:
            xmlstarlet_db51(base_filepath)
        if LXMLPARSER:
            lxml_db51(base_filepath)
    else:
        with os.scandir(path_to_data) as testpath:
            for entry in testpath:
                if entry.name.endswith('docbook51.xml'):
                    if XMLLINT:
                        xmllint_db51(entry.name)
                    if XMLSTARLET:
                        xmlstarlet_db51(entry.name)
                    if JING:
                        jing_db51(entry.name)
                    if SUNMSV:
                        sunmsv_db51(entry.name)
                    if LXMLPARSER:
                        lxml_db51(entry.name)


if __name__ == '__main__':
    filepath = ''
    full_path = os.path.abspath(os.path.dirname(__file__))
    if len(sys.argv) == 2:
        filepath = sys.argv[1]
        if filepath.endswith('/'):
            sys.exit("FATAL: Please enter path without trailing '/'!")
        base_filepath = os.path.basename(filepath)
        dirname = os.path.dirname(filepath)
        if dirname:
            path_to_data = dirname + "/"
        else:
            path_to_data = ""
    elif len(sys.argv) > 2:
        sys.exit("FATAL: Only one argument (path) possible!")
    elif len(sys.argv) == 1:
        path_to_tests = str(Path(full_path).parents[0])
        path_to_data = path_to_tests + "/data/"
    else:
        sys.exit("FATAL: Found no argument at all!")
    main()

