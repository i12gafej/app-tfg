= AsciiDoc3 and DocBook 5.1 README 


To make this document available as html and/or PDF:
----------------
asciidoc3 -a toc -n -a icons /home/bge/ad3/asciidoc3/asciidoc3/doc/readme_docbook51.txt

a2x3 -f pdf /home/bge/ad3/asciidoc3/asciidoc3/doc/readme_docbook51.txt

----------------

== Quickstart
AsciiDoc3's default backend regarding DocBook is 'docbook45'. AsciiDoc3 supports DocBook45 seamlessly since many years - relevant bugs are not known. But - DocBook45 is not developed any more ('feature frozen'), the curent version is DocBook51. If you want to use the flexibility and the more modern conception of DocBook51, AsciiDoc3 supports you.

- To compute just one document with backend docbook45:

-----------------------------------------------------------

asciidoc3 -b docbook51 test.txt

-----------------------------------------------------------

- If you want to switch to DocBook51 as the default backend, edit 'asciidoc3.conf':
 
-----------------------------------------------------------

...
[attributes]
backend-alias-html=xhtml11
#backend-alias-docbook=docbook45    <1>
backend-alias-docbook=docbook51
toclevels=2
toc-placement=auto
sectids=
...
-----------------------------------------------------------

<1> Uncomment line 'backend-alias-docbook=docbook51' and comment out 'backend-alias-docbook=docbook45'.

- Of course you can then use the docbook45 backend if required: '-b docbook51'.

- The result is a new file 'test.xml' - formatted as a valid DocBook51 document.



[NOTE]
In many cases there is no need for action! AsciiDoc3 and DocBook4.5 are working fine. To produce html-pages or PDF's (with the help of 'dblatex' or 'fop') you do not need any DocBook5.x at all ... +
You need DocBook51 if your toolchain depends on valid 5.x documents and/or you need some special/new features of DocBook51, e.g. general markup for annotations or the new and flexible system for linking. Having DocBook 5.1 in a separate namespace allows you to easily mix DocBook markup with other XML-based languages like SVG, MathML, XHTML or even FooBarML. See the details https://docbook.org/docs/howto/howto.html#introduction-why-to-switch[here].



== DocBook 5.1 and AsciiDoc3
=== Overview DocBook 5.1
Compared to DocBook 4.5 in DocBook 5.x changed a few things fundamentally. DocBook 4.5 was defined (only) as a https://en.wikipedia.org/wiki/Document_type_definition[DTD]:
'... the XML DTD is the normative schema...', see this official https://docbook.org/schemas/4x[web ressource]. +
The current version DocBook5.1 has been rewritten as a native https://relaxng.org/[RELAX NG] grammar '... RELAX NG Schema is the normative schema...', see https://docbook.org/schemas/5x.html[here].

The DocBook 5 RelaxNG schema includes embedded http://schematron.com/[Schematron] rules to express certain constraints on some content models. For example, a Schematron rule is added to prevent a sidebar element from containing another sidebar. For complete validation, a validator needs to check both the RelaxNG content models and the Schematron rules (information taken from http://www.sagehill.net/docbookxsl/ProcesingDb5.html[here]).

=== Requirements For Using DocBook51
You don't need any further software than AsciiDoc3 (release 3.2.0 and higher) to use the DocBook51 backend (beside Python3, of course). +
In some cases it is a reasonable effort to install the following packages/software - probably some of them are already present: 

.Recommended Packages/Software to install (apt / zypper ...)
* docbook5-xml
* docbook-xsl-ns
* docbook5-xsl-stylesheets
* libxml2-utils
* python3-lxml     https://lxml.de/ 
* jing             https://relaxng.org/jclark/jing.html
* libmsv-java
* xmlstarlet


=== Validation of DocBook51

The 'text.xml' file should be (not mandatory, but highly recommended) validated before further processing. That means, a tool checks if all rules of the DocBook5.1 definition have been included. As said before we have to validate against two schemas: DocBook51 RelaxNG and Schematron. At the time of writing we need two steps and two different tools: first to ensure the Relax Schema, second, the Schematron Schema.

You find the RelaxNG Schema and the tools in your distribution './tests/docbook_validation/rng-docbook51.rng'. In this directory live four tools to validate your DocBook documents:

-------------------
- asciidoc3_docbook45_validation.py
- asciidoc3_docbook51_relaxng_validation.py
- asciidoc3_docbook51_schematron_validation.py
- asciidoc3_docbook51_w3cxml_validation.py  
-------------------

The tools name show its purpose. You can validate just one file or all files in a distinct directory. The latter is used to validate the results of 'python3 ./tests/testasciidoc3.py --force update':

-----------------------------
python3 ./tests/docbook_validation/asciidoc3_docbook51_relaxng_validation.py

python3 ./tests/docbook_validation/asciidoc3_docbook51_relaxng_validation.py path/to/docbook_file.xml
-----------------------------

[TIP]
The two programs 'asciidoc3_docbook51_schematron_validation.py' and 'asciidoc3_docbook51_w3cxml_validation.py' are work in progress - check https://gitlab.com/asciidoc3/asciidoc3/-/tree/master/tests/docbook_validation for updates.

The tools refer to the following 'third party' tools:

- xmllint
- jing
- sun java msv
- lxml
- xmlstarlet

For debugging we used all of them, probably the easiest to handle are 'xmllint' and 'lxml' - see the docstring of the tools for more inormation. You can disable a program that is not present.


