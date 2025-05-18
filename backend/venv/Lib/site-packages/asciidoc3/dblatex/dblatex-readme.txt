AsciiDoc3 dblatex README
=======================


dblatex http://dblatex.sourceforge.net/ needs further enhancement,
(seems to be outdated)
this files are added for the sake of completeness.

- asciidoc3-dblatex.sty
- asciidoc3-dblatex.xsl

[WARNING]
Do not use customization as described here - that is an experimental plant ...

Customization
-------------
The `./dblatex` directory contains:

`./dblatex/asciidoc3-dblatex.xsl`:: Optional dblatex XSL parameter
customization.

`./dblatex/asciidoc3-dblatex.sty`:: Optional customized LaTeX styles.

Use these files with dblatex(1) `-p` and `-s` options, for example:

  dblatex -p ../dblatex/asciidoc3-dblatex.xsl \
          -s ../dblatex/asciidoc3-dblatex.sty article.xml

