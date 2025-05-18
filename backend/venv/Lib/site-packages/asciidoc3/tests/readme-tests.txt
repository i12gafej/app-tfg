= AsciiDoc3 Tests README

To test the features of AsciiDoc3, please use the information given here and in the 'userguide',
the 'quickstart', and the files in directory ../doc of the distribution.

[WARNING]
You may safely remove directory 'tests' (and subfolders - if any -) and the entire data
they contain. This will *not* have any effect on the execution of AsciiDoc3! 

[NOTE]
The first part of this README covers 'asciidoc3.py'. +
To test 'a2x3.py', see chapter a2x3 <<link_a2x3,here>>.


Most users are happy to see AsciiDoc3 work in the expected way, and so it does! If you like 
to see even more examples of the power of AsciiDoc3, try this:

-------------------
cd ~/asciidoc3/tests

python3 testasciidoc3.py --force update
-------------------

You'll see something like this on stdout:

-------------------
WRITING: data/testcases_docbook45-docbook45.xml
WRITING: data/testcases_docbook45-html4.html
WRITING: data/testcases_docbook45-xhtml11.html
WRITING: data/testcases_docbook45-html5.html
WRITING: data/testcases_docbook51-docbook51.xml
WRITING: data/testcases_docbook51-html4.html
WRITING: data/testcases_docbook51-xhtml11.html
WRITING: data/testcases_docbook51-html5.html
WRITING: data/filters-test-html4.html
WRITING: data/filters-test-xhtml11.html
 ...
WRITING: data/faq-html5.html
WRITING: data/userguide-docbook45.xml
WRITING: data/userguide-docbook51.xml
WRITING: data/userguide-xhtml11.html
WRITING: data/userguide-html4.html
WRITING: data/userguide-html5.html
WRITING: data/nonvalid_docbook51-docbook51.xml
WRITING: data/nonvalid_docbook51-xhtml11.html
-------------------

Change to ./data and check out the multi-faceted 200 files computed by AsciiDoc3.
They underline the capabilities of the program. 

Beside the new files in ./data there are a few generated md5/png in ../images.


== Validation

To validate the AsciiDoc3-produced files against DocBook45 and/or DocBook51 schemas: 

--------------
python3 /home/bge/ad3/asciidoc3/asciidoc3/tests/docbook_validation/asciidoc3_docbook45_validation.py

python3 /home/bge/ad3/asciidoc3/asciidoc3/tests/docbook_validation/asciidoc3_docbook51_relaxng_validation.py

python3 /home/bge/ad3/asciidoc3/asciidoc3/tests/docbook_validation/asciidoc3_docbook51_schematron_validation.py

--------------

See the docstring of the three programs and ./doc/readme_docbook51.txt.



== Usage

If you like to develop and test your own asciidoc3.py (or the conf-files, respectively), you can test the output
with the help of 'testasciidoc3.py', too: 

--------------
python3 testasciidoc3.py
--------------

gives you the 'usage'

----------------
Usage: testasciidoc3.py [OPTIONS] COMMAND
Run AsciiDoc3 conformance tests specified in configuration FILE.

Commands:
  list                          List tests
  run [NUMBER] [BACKEND]        Execute tests
  update [NUMBER] [BACKEND]     Regenerate and update test data

Options:
  -f, --conf-file=CONF_FILE
        Use configuration file CONF_FILE (default configuration file is
        testasciidoc3.conf in testasciidoc3.py directory)
  --force
        Update all test data overwriting existing data
----------------

== List

So we have:

----------------
python3 testasciidoc3.py list

1: Test cases DocBook45
2: Test cases DocBook51
3: Filters
4: Tables DocBook45
5: Tables DocBook51
6: Source highlighter
7: Example article DocBook45
8: Example article DocBook51
9: Example article with embedded images (data URIs)
10: Example article (DocBook45) with included docinfo file.
11: Example article (DocBook51) with included docinfo file.
12: Example book
13: Example multi-part book (DocBook41)
14: Example multi-part book (DocBook51)
15: Man page
16: Example slideshow
17: ASCIIMathML
18: LaTeXMathML
19: LaTeX Math
20: LaTeX Filter
21: UTF-8 Examples
22: Additional Open Block and Paragraph styles
23: English language file (article)
24: English language file (book)
25: English language file (manpage)
26: Russian language file (article)
27: Russian language file (book)
28: Russian language file (manpage)
29: French language file (article)
30: French language file (book)
31: French language file (manpage)
32: German language file (article)
33: German language file (book)
34: German language file (manpage)
35: Swedish language file (article)
36: Swedish language file (book)
37: Japanese language file (article)
38: Japanese language file (book)
39: Hungarian language file (article)
40: Hungarian language file (book)
41: Hungarian language file (manpage)
42: Spanish language file (article)
43: Spanish language file (book)
44: Spanish language file (manpage)
45: Brazilian Portuguese language file (article)
46: Brazilian Portuguese language file (book)
47: Brazilian Portuguese language file (manpage)
48: Ukrainian language file (article)
49: Ukrainian language file (book)
50: Ukrainian language file (manpage)
51: Dutch language file (article)
52: Dutch language file (book)
53: Dutch language file (manpage)
54: Italian language file (article)
55: Italian language file (book)
56: Italian language file (manpage)
57: Czech language file (article)
58: Czech language file (book)
59: Czech language file (manpage)
60: Romanian language file (article)
61: Romanian language file (book)
62: Romanian language file (manpage)
63: RCS $Id$ marker test
64: UTF-8 BOM test
65: # Deprecated quote attributes
66: FAQ file (article)
67: Userguide
68: Example of a nonvalid AsciiDoc3 DocBook51 document : against RelaxNG valid, but not Schematron

----------------------------

or, as an example

== Run


----------------------------
python3 testasciidoc3.py run 32

32: German language file (article)
SOURCE: asciidoc3: data/lang-de-test.txt
PASSED: docbook45: data/lang-de-article-test-docbook45.xml
PASSED: docbook51: data/lang-de-article-test-docbook51.xml
PASSED: xhtml11: data/lang-de-article-test-xhtml11.html
PASSED: html4: data/lang-de-article-test-html4.html
PASSED: html5: data/lang-de-article-test-html5.html

TOTAL PASSED:  5 <1>

-----------------------------

<1> 'TOTAL SKIPPED' pops up because testasciidoc3.py first needs to generate the output to compare
with 'testasciidoc3.py run', run 'python3 testasciidoc3.py --force update' first or:


== Update

----------------------------
python3 testasciidoc3.py update 32 xhtml11

WRITING: data/lang-de-article-test-xhtml11.html
----------------------------

Now it works as expected:

----------------------------
python3 testasciidoc3.py run 32 xhtml11

32: German language file (article)
SOURCE: asciidoc3: data/lang-de-test.txt
PASSED: xhtml11: data/lang-de-article-test-xhtml11.html

TOTAL PASSED:  1
-----------------------------

With this information feel free to perform your own test series ...


== a2x3
Use [[link_a2x3]] 'testa2x3.py' in the identical directory to perform an intense test of 'a2x3.py'.

-------------------
cd ~/asciidoc3/tests

python3 testa2x3.py
-------------------

The output is written to the new created directory '~/asciidoc3/tests/data/a2x3testdata/'

[NOTE]
To see all features and the full power of 'a2x3.py' you have - if possible - to install some third-party programs: +
lynx, fop, w3m, epubcheck, dblatex ...

[NOTE]
If you see errors when computing a particular task, it is possible that a separate command 'python3' does the trick. Example +

-----------
...
  a2x3: ERROR: "dblatex" -t pdf -p "/home/user/ad3_exp/dblatex/asciidoc3-dblatex.xsl" -s "/home/user/ad3_exp/dblatex/asciidoc3-dblatex.sty"   "/home/user/ad3_exp/tests/data/lang-ro-test.xml" returned non-zero exit status 1
...
----------

Try on the command line:

-----------

python3 ../a2x3.py -f pdf lang-ro-test.xml

----------





