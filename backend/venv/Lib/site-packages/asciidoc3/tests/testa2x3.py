#!/usr/bin/env python3

"""\
Run a bunch of 'a2x3' testcases analogue to 'testasciidoc3.py'
(which tests asciidoc3.py).
First some files are copied to ./tests/data/a2x3testdata, in a
second step a2x3 is executed in diverse approaches.
See the 'command lines' presented as 'TEST_TUPLE'.
Be sure to have all needed programs installed: dblatex, lynx,
w3m, epubcheck, dblatex, fop ...

Before you can run testa2x3.py you have to start
'python3 testasciidoc3.py --force update'
to produce the testfiles. Output is written to
'./tests/data/a2x3testdata/'

You have to start this program from inside the 'tests' directory:
[cd ./tests]

Usage
[cd ./tests &&] \
[python3 testasciidoc3.py --force update &&] \
python3 testa2x3.py [-v]

Docker
When using the AsciiDoc3 Docker-Container:
'docker run ... asciidoc3:full python3 tests/testasciidoc3.py --force update'
and then
'docker run ... asciidoc3:full python3 tests/testa2x3.py [-v]'

Known bugs
If producing dvi/ps, the source must not contain images - this seems to
be a 'dblatex' issue ... (?)

Copyright (C) 2020 by Berthold Gehrke <berthold.gehrke@gmail.com>
Free use of this software is granted under the terms of the
GNU General Public License Version 2 or higher (GNU GPLv2+).
"""

from argparse import ArgumentParser
from concurrent import futures
import os
import shutil
import subprocess


DESCRIPTION = """\
Run tests for AsciiDoc3 'a2x3'
Use option '-v' to see a2x3 working.
Don't forget to change to directory ./test !
"""
ARG_PARSER = ArgumentParser(usage='usage: [cd ./tests &&] \
    [python3 testasciidoc3.py --force update &&] \
    python3 testa2x3.py [-v]',
                            description=DESCRIPTION)
ARG_PARSER.add_argument('-v', '--verbose', action='store_true', default=False,
                        help='see more output or debugging')
ARGS = ARG_PARSER.parse_args()


def remove_testitems():
    """Remove files from previous tests"""
    if os.path.exists(add_dockerpath+'data/a2x3testdata/'):
        shutil.rmtree(add_dockerpath+'data/a2x3testdata/')
        if ARGS.verbose:
            print("remove data/a2x3testdata/")


def copy_testfiles():
    """Copy files to data/a2x3testdata/"""
    os.mkdir(add_dockerpath+'data/a2x3testdata/')
    for file_item in ('test.txt',
                      'a2x3.1.txt',
                      ):
        if os.path.exists(ad3dir+'doc/'+file_item):
            shutil.copy2(ad3dir+'doc/'+file_item,
                         add_dockerpath+'data/a2x3testdata/'+file_item)
            if ARGS.verbose:
                print("copy "+file_item)
    # We use copies of 'test.txt' to test text, pdf, fop, epub, epubcheck ...'
    if os.path.exists(add_dockerpath+'data/a2x3testdata/test.txt'):
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/pdf_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/fop_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/lynx_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/w3m_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/fop_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/epub_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/epub_artifacts_test.txt')
#       Test cancelled
#        shutil.copy2('data/a2x3testdata/test.txt',
#                     'data/a2x3testdata/epubcheck_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/docbook_test.txt')
        shutil.copy2(add_dockerpath+'data/a2x3testdata/test.txt',
                     add_dockerpath+'data/a2x3testdata/chunked_test.txt')
        shutil.copy2(add_dockerpath+'data/test-docbook45.xml',
                     add_dockerpath+'data/a2x3testdata/test-docbook45.xml')
        shutil.copy2(add_dockerpath+'data/faq-docbook45.xml',
                     add_dockerpath+'data/a2x3testdata/faq_dvi_test_45.xml')
        shutil.copy2(add_dockerpath+'data/faq-docbook51.xml',
                     add_dockerpath+'data/a2x3testdata/faq_ps_test_51.xml')
        shutil.copy2(add_dockerpath+'data/test-docbook51.xml',
                     add_dockerpath+'data/a2x3testdata/tex_test_51.xml')
        if ARGS.verbose:
            print("copy testfiles to data/a2x3testdata/")
    if not os.path.exists(add_dockerpath+'data/a2x3testdata/images/redsquare'):
        os.mkdir(add_dockerpath+'data/a2x3testdata/images/')
        shutil.copy2(ad3dir+'images/redsquare.jpg',
                     add_dockerpath+'data/a2x3testdata/images/redsquare.jpg')
        if ARGS.verbose:
            print("copy redsquare.jpg to ./data/a2x3testdata/images")
            print("")


def run_tests_a2x3(list_data):
    """Run tests parallel"""
    arg_list = ['a2x3']
    if ARGS.verbose:
        arg_list += ['-v']
    arg_list += list_data
    if ARGS.verbose:
        print(arg_list)
    subprocess_a2x3test = subprocess.run(arg_list)
    if subprocess_a2x3test.returncode:
        print("[WARNING] Returncode != zero running", arg_list)


if __name__ == '__main__':
    """\
    When running inside a container, we need to alter the paths.
    """
    add_dockerpath = ''
    ad3dir = '../'
    if os.path.exists('/.dockerenv'):
        path_to_testa2x3_py = os.getcwd()+"/"+__file__
        testdir = os.path.dirname(path_to_testa2x3_py)+"/"
        add_dockerpath = testdir
        ad3dir = testdir[:-6]
        if ARGS.verbose:
            print("Found '/.dockerenv': working inside a container.")
    else:
        if ARGS.verbose:
            print("No container found.")

    TEST_TUPLE = (
        # txt to pdf
        ['-f', 'pdf',
         add_dockerpath+'data/a2x3testdata/pdf_test.txt'],
        # txt to pdf using fop
        ['-f', 'pdf', '--fop',
         add_dockerpath+'data/a2x3testdata/fop_test.txt'],
        # txt to epub
        ['-f', 'epub',
         add_dockerpath+'data/a2x3testdata/epub_test.txt'],
        # txt to epub leave artifacts
        ['-f', 'epub', '-k',
         add_dockerpath+'data/a2x3testdata/epub_artifacts_test.txt'],
        # txt to epub epubcheck (test cancelled)
        # ['-f', 'epub', '-k', '--epubcheck',
        #  'data/a2x3testdata/epubcheck_test.txt'],
        # txt to text (lynx)
        ['-f', 'text', '--lynx',
         add_dockerpath+'data/a2x3testdata/lynx_test.txt'],
        # txt to text (w3m)
        ['-f', 'text',
         add_dockerpath+'data/a2x3testdata/w3m_test.txt'],
        # txt to xhtml
        ['-f', 'xhtml',
         add_dockerpath+'data/a2x3testdata/test.txt'],
        # txt to manpage
        ['-f', 'manpage', '-d', 'manpage',
         add_dockerpath+'data/a2x3testdata/a2x3.1.txt'],
        # txt to docbook xml
        ['-f', 'docbook',
         add_dockerpath+'data/a2x3testdata/docbook_test.txt'],
        # xml (docbook) to pdf
        ['-f', 'pdf',
         add_dockerpath+'data/a2x3testdata/test-docbook45.xml'],
        # txt to chunked
        ['-f', 'chunked',
         add_dockerpath+'data/a2x3testdata/chunked_test.txt'],
        # xml (docbook) to dvi
        ['-f', 'dvi',
         add_dockerpath+'data/a2x3testdata/faq_dvi_test_45.xml'],
        # xml (docbook) to ps
        ['-f', 'ps',
         add_dockerpath+'data/a2x3testdata/faq_ps_test_51.xml'],
        # xml (docbook) to tex
        ['-f', 'tex',
         add_dockerpath+'data/a2x3testdata/tex_test_51.xml'],
        )
    remove_testitems()
    copy_testfiles()
    with futures.ProcessPoolExecutor(max_workers=3) as e:
        for test_item in TEST_TUPLE:
            e.submit(run_tests_a2x3, test_item)
