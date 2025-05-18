= AsciiDoc3 README 


Welcome to AsciiDoc3! It is a good decision to use the power of AsciiDoc3:

*******************************************
- Write valid DocBook45 (or DocBook51) documents in an easy way!
- No muddle with opening and closing tags, just use the simple Markup language!
- Produce html, xml, pdf ... out of one plain text document!
- utf-8 is the default input and output encoding, but you can choose almost every coding page.
- No special software needed - you may use your known editor (vim, gedit, notepad, emacs ...).
- Free license: GPLv2 or higher.
- Runs with GNU/Linux and Windows.
*******************************************


== General Information version 3.2.3
All information you need is written online at AsciiDoc3's https://asciidoc3.org[homepage].

AsciiDoc3 is available as tarball, zip, deb, rpm, git checkout and PyPI.

You don't need admin/root rights to work with AsciiDoc3.

Use your known editor: vim, emacs, gedit, notepad ... It works out of the box.


=== Usage
Once you have written your text 'mytext.txt' type

-----------------------------

asciidoc3 -a toc -n -a icons mytext.txt

a2x3 -f pdf mytext.txt

----------------

You find many 'templates' in your distribution:

--------------------------
- ./doc/*.*
- ./tests/data/*.*
--------------------------

=== DocBook 4.5 or DocBook 5.1
AsciiDoc3's default backend regarding DocBook is 'docbook45'. DocBook45 is not developed any more ('feature frozen'), the curent version is DocBook51. See './doc/readme_docbook51.txt' to learn how to use AsciiDoc3s DocBook51 options.


=== Userguide
The complete userguide is found https://asciidoc3.org/userguide.html[online] and here: './doc/userguide.txt' If you like to read this as a PDF: 'a2x3 -f pdf userguide.txt'. +
The userguide is updated online regularly.
