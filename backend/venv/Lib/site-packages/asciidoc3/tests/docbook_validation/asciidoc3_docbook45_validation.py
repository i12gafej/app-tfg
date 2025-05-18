#!/usr/bin/env python3

'''
./tests/docbook_validation/asciidoc3_docbook45_validation.py
validation against DTD DocBook4.5

Tests all DocBook45-files produced with testasciidoc3.py found
in directory './tests/data' if valid against the
DocBook45 DTD.
We are using the following tools to validate:
- xmllint     (Package libxml2-utils)
- xmlstarlet  (Package xmlstarlet)
- lxml.de     (Package python3-lxml)
Check if present on command line with 'xmllint' and 'xmlstarlet' and
with 'import lxml'.
You can disable any program that is not available, but it is recommended
to make use of at least two validators to make the test more reliable.

USAGE:
'python3 asciidoc3_docbook45_validation.py'
to test all files ending with 'docbook45.xml' in directory './tests/data' or
'python3 asciidoc3_docbook45_validation.py path/to/db45_xml_file.xml'
to validate just one file.

Copyright: (c) 2020 Berthold Gehrke <berthold.gehrke@gmail.com>
License:   GNU GPL v2 or higher
'''

import os
from pathlib import Path
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
# LXMLPARSER = ''  # Uncomment to disable lxmlparser.


def xmllint_db45(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    subprocess.run(["xmllint", "--nonet", "--noout", "--valid",
                    path_to_data + testfile])


def xmlstarlet_db45(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    subprocess.run(["xmlstarlet", "val", "--dtd",
                    "/usr/share/xml/docbook/schema/dtd/4.5/docbookx.dtd",
                    "-q", path_to_data + testfile])


def lxml_db45(testfile):
    '''
    xmmlint uses xml catalog.
    Be sure to have package 'docbook' installed.
    '''
    db45_parser = etree.XMLParser(dtd_validation=True)
    try:
        etree.parse(path_to_data + testfile, db45_parser)
    except etree.XMLSyntaxError:
        print("lxml reports", testfile, "******* invalid *******")


def main():
    if filepath:
        if XMLLINT:
            xmllint_db45(base_filepath)
        if XMLSTARLET:
            xmlstarlet_db45(base_filepath)
        if LXMLPARSER:
            lxml_db45(base_filepath)
    else:
        with os.scandir(path_to_data) as testpath:
            for entry in testpath:
                if entry.name.endswith('docbook45.xml'):
                    if XMLLINT:
                        xmllint_db45(entry.name)
                    if XMLSTARLET:
                        xmlstarlet_db45(entry.name)
                    if LXMLPARSER:
                        lxml_db45(entry.name)


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

