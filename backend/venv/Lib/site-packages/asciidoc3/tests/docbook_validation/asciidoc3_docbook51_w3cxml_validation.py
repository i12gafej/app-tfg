#!/usr/bin/env python3

'''

PLACEHOLDER, see updates 
https://gitlab.com/asciidoc3/asciidoc3/-/blob/master/tests/docbook_validation/asciidoc3_docbook51_w3cxml_validation.py

./tests/docbook_validation/asciidoc3_docbook51_w3cxml_validation.py
validation docbook51 dtd

Tests all DocBook51-files produced with testasciidoc3.py found
in directory './tests/data' if valid against
usr/share/xml/docbook/schema/xsd/5.0/docbook.xsd


Copyright: (c) 2020 Berthold Gehrke <berthold.gehrke@gmail.com>
License:   GNU GPL v2 or higher

USAGE:
'python3 asciidoc3_docbook51_w3cxml_validation.py' to validate all '.*docbook51.xml' files in ./tests/data
'python3 asciidoc3_docbook51_w3cxml_validation.py /path/to/docbook51_file.xml'

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
    print("FATAL: Module lxml not found!")
    print("Try 'sudo apt-install python3-lxml' or so ...")
    sys.exit()
   
#/usr/share/xml/docbook/schema/xsd/5.0/docbook.xsd

sys.exit("placeholder")


