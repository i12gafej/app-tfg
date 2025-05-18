#!/usr/bin/env python3

"""Tests asciidoc3-generated xml (or of course any other xml) files
   against the docbook51 schematron schema - heuristic approach.

   USAGE:
   'python3 asciidoc3_docbook51_schematron_validation.py'
   to test all files ending with 'docbook51.xml' in directory './tests/data' or
   'python3 asciidoc3_docbook51_schematron_validation.py path/to/db51_xml_file.xml'
   to validate just one file.
   Example:
   'python3 asciidoc3.py -b docbook51 ./tests/data/nonvalid_docbook51.txt'
   and now
   'python3 asciidoc3_docbook51_schematron_validation.py ../data/nonvalid_docbook51.xml'
   to see the test finding a non-valid document (which relaxng doesn't detect.
   
   This is a BETA version, provided "as is", no warranty.
   Please note: False positive and false negative results are possible.

   (c) 2020 by Berthold Gehrke <berthold.gehrke@gmail.com>
   License: GNU General Public License v2 or higher (GPLv2+)
   """

import xml.etree.ElementTree as et
from io import StringIO
import os
from pathlib import Path
import re
import sys


def schematron51_check(db51testfile):
    # print("!beta! Starting schematron validation DocBook5.1: ", db51testfile)
    try:
        with open(path_to_data + db51testfile, 'r') as testfile:
            testcontent = testfile.read()
    except (MemoryError, OSError):
        sys.exit("Giving up - File to large?", db51testfile)
    testcontent, counter = re.subn(r'\A.*?(<\?xml.*?>)\s*?<',
                                   '<', testcontent, 1, flags=re.DOTALL)
    testcontent, counter = re.subn(r'\A<\?.*?toc\?>\s*<',
                                   '<', testcontent, 1, flags=re.DOTALL)
    testcontent, counter = re.subn(r'\A<\?.*?numbered\?>\s*<',
                                   '<', testcontent, 1, flags=re.DOTALL)
    # root element must have an attribute "version"
    testcontent, counter = re.subn(r'\A(<[^>]*?version=[^>]*?>\s*<)',
                                   '\g<1>', testcontent, 1, flags=re.DOTALL)
    if not counter:
        print("*!*!*!*!", db51testfile, "not valid!")
        print(" Must have an attribute 'version' in root element: not found.")

    try:
        testcontent = StringIO(testcontent)
        tree = et.parse(testcontent)
        t = tree.getroot()
    except (MemoryError, OSError):
        sys.exit("Giving up - File to large?", db51testfile)
    # At this time we have "t" the etree of file "db51testfile" in memory.
    # We can delete "testcontent" to spare some memory.
    del(testcontent)
    # Now we fill the lists of elements which have restrictions in
    # DocBook51 Schematron.
    
    # 'seglistitem' not used in Asciidoc3
    # 'annotation' not used in Asciidoc3
    caution_list = list()
    important_list = list()
    note_list = list()
    tip_list = list()
    warning_list = list()
    caption_list = list()
    equation_list = list()
    example_list = list()
    figure_list = list()
    table_list = list()
    footnote_list = list()
    sidebar_list = list()
    entry_list = list()
    footnoteref_list = list()
    # 'firstterm' not used in Asciidoc3
    glossterm_list = list()  # TODO
    # 'glossseealso' not used in Asciidoc3
    # 'termdef' not used in Asciidoc3
    # 'glosssee' not used in Asciidoc3
    indexterm_list = list()  # TODO
    # 'synopfragmentref' not used in Asciidoc3
    # 'xlink:type 'arc', 'extended', 'locator', 'resource',
    # and 'title' are not used in Asciidoc3.

    # Iter through the entire tree to fill the lists.
    for elem in t.iter(tag='*'):
        if elem.tag == '{http://docbook.org/ns/docbook}caution':
            caution_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}important':
            important_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}note':
            note_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}tip':
            tip_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}warning':
            warning_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}caption':
            caption_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}equation':
            equation_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}example':
            example_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}figure':
            figure_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}table':
            table_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}footnote':
            footnote_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}sidebar':
            sidebar_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}entry':
            entry_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}footnoteref':
            footnoteref_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}glossterm':
            glossterm_list.append(elem)
        elif elem.tag == '{http://docbook.org/ns/docbook}indexterm':
            indexterm_list.append(elem)
    # Now we define the specific 'error function' regarding the elements.

    def caution_error():
        caution_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}caution',
            '{http://docbook.org/ns/docbook}important',
            '{http://docbook.org/ns/docbook}note',
            '{http://docbook.org/ns/docbook}tip',
            '{http://docbook.org/ns/docbook}warning', ])
        for node in caution_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in caution_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'caution'")

    def important_error():
        important_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}caution',
            '{http://docbook.org/ns/docbook}important',
            '{http://docbook.org/ns/docbook}note',
            '{http://docbook.org/ns/docbook}tip',
            '{http://docbook.org/ns/docbook}warning', ])
        for node in important_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in important_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'important'")

    def note_error():
        note_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}caution',
            '{http://docbook.org/ns/docbook}important',
            '{http://docbook.org/ns/docbook}note',
            '{http://docbook.org/ns/docbook}tip',
            '{http://docbook.org/ns/docbook}warning', ])
        for node in note_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in note_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'note'")

    def tip_error():
        tip_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}caution',
            '{http://docbook.org/ns/docbook}important',
            '{http://docbook.org/ns/docbook}note',
            '{http://docbook.org/ns/docbook}tip',
            '{http://docbook.org/ns/docbook}warning', ])
        for node in tip_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in tip_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'tip'")

    def warning_error():
        warning_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}caution',
            '{http://docbook.org/ns/docbook}important',
            '{http://docbook.org/ns/docbook}note',
            '{http://docbook.org/ns/docbook}tip',
            '{http://docbook.org/ns/docbook}warning', ])
        for node in warning_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in warning_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'warning'")

    def caption_error():
        caption_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}caution',
            '{http://docbook.org/ns/docbook}equation',
            '{http://docbook.org/ns/docbook}example',
            '{http://docbook.org/ns/docbook}figure',
            '{http://docbook.org/ns/docbook}equation',
            '{http://docbook.org/ns/docbook}important',
            '{http://docbook.org/ns/docbook}note',
            '{http://docbook.org/ns/docbook}sidebar',
            '{http://docbook.org/ns/docbook}table',
            '{http://docbook.org/ns/docbook}task',
            '{http://docbook.org/ns/docbook}tip',
            '{http://docbook.org/ns/docbook}warning', ])
        for node in caption_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in caption_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'caption'")

    def equation_error():
        equation_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}equation',
            '{http://docbook.org/ns/docbook}example',
            '{http://docbook.org/ns/docbook}figure',
            '{http://docbook.org/ns/docbook}table', ])
        for node in equation_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in equation_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'equation'")

    def example_error():
        example_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}equation',
            '{http://docbook.org/ns/docbook}example',
            '{http://docbook.org/ns/docbook}figure',
            '{http://docbook.org/ns/docbook}table', ])
        for node in example_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in example_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'example'")

    def figure_error():
        figure_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}equation',
            '{http://docbook.org/ns/docbook}example',
            '{http://docbook.org/ns/docbook}figure',
            '{http://docbook.org/ns/docbook}table', ])
        for node in figure_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in figure_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'figure'")

    def table_error():
        table_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}equation',
            '{http://docbook.org/ns/docbook}example',
            '{http://docbook.org/ns/docbook}figure', ])
        for node in table_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in table_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'table'")

    def footnote_error():
        footnote_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}caution',
            '{http://docbook.org/ns/docbook}epigraph',
            '{http://docbook.org/ns/docbook}equation',
            '{http://docbook.org/ns/docbook}example',
            '{http://docbook.org/ns/docbook}figure',
            '{http://docbook.org/ns/docbook}footnote',
            '{http://docbook.org/ns/docbook}important',
            '{http://docbook.org/ns/docbook}note',
            '{http://docbook.org/ns/docbook}sidebar',
            '{http://docbook.org/ns/docbook}table',
            '{http://docbook.org/ns/docbook}task',
            '{http://docbook.org/ns/docbook}tip',
            '{http://docbook.org/ns/docbook}warning', ])
        for node in footnote_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in footnote_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'footnote'")

    def sidebar_error():
        sidebar_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}sidebar', ])
        for node in sidebar_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in sidebar_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'sidebar'")

    def entry_error():
        entry_not_allowed = frozenset([
            '{http://docbook.org/ns/docbook}informaltable',
            '{http://docbook.org/ns/docbook}table', ])
        for node in entry_list:
            for item in list(node.iter('*'))[1:]:
                if item.tag in entry_not_allowed:
                    print("*!*!*!*!", db51testfile, "not valid!")
                    print(" Found " + item.tag[31:] + " as")
                    print(" descendant of 'entry'")

    def footnoteref_error():
        """ beta, TODO """
        footnoteref_linkend_list = list()
        footnote_anchor_list = list()
        for node in footnoteref_list:
            footnoteref_linkend_list.append(node.get('linkend'))
            # print("footnoteref_linkend_list ", footnoteref_linkend_list)
            # There is at least one "footnoteref linkend", but not a "footnote" at all
            if footnoteref_linkend_list and not footnote_list:
                print("*!*!*!*!", db51testfile, "not valid!")
                print(" Did not found any footnote,")
                print(" but there is a 'footnoteref linkend'")
            # document contains both "footnoteref linkend" and "footnote"
            elif footnoteref_linkend_list and footnote_list:
                for item in footnote_list:
                    footnote_anchor_list.append(item.get(
                        '{http://www.w3.org/XML/1998/namespace}id'))
                # print("footnote_anchor_list", footnote_anchor_list)
                for item_fl in footnoteref_linkend_list:
                    if item_fl not in footnote_anchor_list:
                        print("*!*!*!*!", db51testfile, "not valid!")
                        print(" No '" + item_fl + "' as ref in any footnote")
            else:
                pass  # valid so far (document contains no "footnoteref linkend")
                
    def glossterm_error():
        """ TODO """
        pass

    def indexterm_error():
        """ TODO """
        pass

    if caution_list:
        caution_error()
    if important_list:
        important_error()
    if note_list:
        note_error()
    if tip_list:
        tip_error()
    if warning_list:
        warning_error()
    if caption_list:
        caption_error()
    if equation_list:
        equation_error()
    if example_list:
        example_error()
    if figure_list:
        figure_error()
    if table_list:
        table_error()
    if footnote_list:
        footnote_error()
    if sidebar_list:
        sidebar_error()
    if entry_list:
        entry_error()
    if footnoteref_list:
        footnoteref_error()
    if glossterm_list:
        glossterm_error()
    if indexterm_list:
        indexterm_error()


def main():
    if filepath:
        schematron51_check(base_filepath)
    else:
        with os.scandir(path_to_data) as testpath:
            for entry in testpath:
                if entry.name.endswith('docbook51.xml'):
                    schematron51_check(entry.name)


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
