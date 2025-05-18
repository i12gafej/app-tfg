###!/usr/bin/env python3

"""
This script sets some symlinks inside the AsciiDoc3 package
installed via pip / pip3 from 'https://pypi.org/project/asciidoc3/'
with 'pip3 install --user asciidoc3'.
Run it immediately subsequently after install.
See https://asciidoc3.org/pypi.html for more information.
Do _not_ run as root/Admin - nothing happens.

Copyright (C) 2018-2021 by Berthold Gehrke <berthold.gehrke@gmail.com>
Free use of this software is granted under the terms of the
GNU General Public License Version 2 or higher (GNU GPLv2+).
"""

import os
import platform
import re
import shutil
import subprocess
import sys


def main():
    """
    Pip is of course available since we just ran 'pip install'.
    Uses 'pip show asciidoc3' to locate AsciiDoc3's config-dirs.
    Then we set symlinks; at first within AsciiDoc3,
    then from the home directory to the data-files.
    This should work with POSIX systems like GNU/Linux and with Windows, too.
    """
    USERHOMEDIR = os.path.expanduser("~")
    # GNU/Linux: '/home/<username>', root: '/root'
    # Windows: 'C:\\Users\\<username>', Admin: 'C:\\Windows\\system32'

    def adjust_testad3():
        """ Only on Windows.
            Adjust ./tests/testasciidoc3.py to run tests:
            set asciidoc3api.AsciiDoc3API(path_to_asciidoc3.py)
            Change encoding from cp1252 to utf-8.
            POSIX: see section below 'POSIX (GNU/Linux, BSD, ...)'
            """
        USERHOMEDIR_escaped = re.escape(USERHOMEDIR)
        if os.path.exists(USERHOMEDIR + r"\asciidoc3\tests\testasciidoc3.py"):
            with open(USERHOMEDIR + r"\asciidoc3\tests\testasciidoc3.py", 'r',
                      encoding='utf-8') as testfile:
                file_content = testfile.read()
                # Adjust AsciiDoc3API()
                file_content = re.sub(
                    r'asciidoc3 = asciidoc3api\.AsciiDoc3API\(\)',
                    r'# Change path if needed - see asciidoc3api.txt!\n'
                    r'        asciidoc3 = asciidoc3api.AsciiDoc3API(r"'
                    + USERHOMEDIR_escaped + r'aaasciidoc3aaasciidoc3.py")',
                    file_content, 1)
                # Adjust encoding (Windows has cp1252), part i
                file_content = re.sub(
                    r"f = open\(self\.backend_filename\(backend\)\)",
                    r"# Added encoding='utf-8', because Windows assumes cp1252\n"
                    r"        f = open(self.backend_filename(backend), encoding = 'utf-8')",
                    file_content, 1)
                # Adjust encoding (Windows has cp1252), part ii
                file_content = re.sub(
                    r"f = open\(self\.backend_filename\(backend\), 'w\+'\)",
                    r"# Added encoding='utf-8', because Windows assumes cp1252\n"
                    r"        f = open(self.backend_filename(backend), 'w+', encoding = 'utf-8')",
                    file_content, 1)
                file_content = re.sub(r'aaasciidoc3aaasciidoc3.py',
                                      r'\\asciidoc3\\asciidoc3.py',
                                      file_content, 1)
            with open(USERHOMEDIR + r"\asciidoc3\tests\testasciidoc3.py",
                      'w', encoding='utf-8') as testfile:
                testfile.write(file_content)

    ad3_location = ''
    try:
        # setting var py3_exe is to prevent subprocess from using (Python2-) pip
        # https://github.com/asciidoc3/asciidoc3/issues/9
        # GNU/Linux: sys.executable = /usr/bin/python3(\.x)? # regex
        # GNU/Linux 'venv': sys.executable = /home/<username>/<venv-dir>/bin/python
        #print("sys.executable", sys.executable)
        py3_exe = sys.executable
        runpip = subprocess.Popen('"'+py3_exe+'"' + " -m pip show asciidoc3", shell=True,
                                  stdin=subprocess.PIPE,
                                  stdout=subprocess.PIPE,
                                  universal_newlines=True, bufsize=-1)
        runpip.wait()
        if runpip.returncode:
            sys.exit("FATAL: 'pip show asciidoc3' ends with non-zero exit code")
        output = runpip.communicate()
    except OSError:
        sys.exit("FATAL: 'pip show asciidoc3' ends with an unidentified error ...")
    if output:
        output = output[0]
        output = re.split(r'Location: ', output, re.DOTALL)[1]
        output = re.split(r'\nRequires', output, re.DOTALL)[0]
        ad3_location = output
        #  string 'ad3_location' looks like this:
        #  GNU/Linux
        #    no venv
        #      '/home/<username>/.local/lib/python3.8/site-packages'
        #      '/home/<username>/.local/lib/python3.10/site-packages'
        #    venv
        #      '/home/<username>/<venv-dir>/lib/python3.8/site-packages'
        #      '/home/<username>/<venv-dir>/lib/python3.10/site-packages'
        #
        #  Windows
        #    no venv
        #      'c:\\users\\<username>\\appdata\\roaming\\python\\python38\\site-packages'
        #      'c:\\users\\<username>\\appdata\\roaming\\python\\python310\\site-packages'
        #    venv
        #      'c:\\users\\<username>\\<venv-dir>\\lib\\site-packages'
    else:
        sys.exit("FATAL: 'pip show asciidoc3' gives no information ...")

    # ###########################
    # POSIX (GNU/Linux, BSD, ...)
    # ###########################
    if os.name == 'posix':
        if USERHOMEDIR.lower().startswith(r'/root'):
            sys.exit("FATAL: Do not run as root! Script does nothing at all.")

        # AsciiDoc3 distribution, set internal (relative) symlinks.
        # <...>/asciidoc3/filters/music/images --> ../../images
        if os.path.exists(ad3_location + r"/asciidoc3/filters/music/images"):
            os.unlink(ad3_location + r"/asciidoc3/filters/music/images")
        os.symlink(os.path.relpath(
            ad3_location + r"/asciidoc3/images", ad3_location + r"/asciidoc3/filters/music"),
                   ad3_location + r"/asciidoc3/filters/music/images")

        # <...>/asciidoc3/filters/graphviz/images --> ../../images
        if os.path.exists(ad3_location + r"/asciidoc3/filters/graphviz/images"):
            os.unlink(ad3_location + r"/asciidoc3/filters/graphviz/images")
        os.symlink(os.path.relpath(
            ad3_location + r"/asciidoc3/images", ad3_location + r"/asciidoc3/graphviz/music"),
                   ad3_location + r"/asciidoc3/filters/graphviz/images")

        # <...>/asciidoc3/doc/images --> ../images
        if os.path.exists(ad3_location + r"/asciidoc3/doc/images"):
            os.unlink(ad3_location + r"/asciidoc3/doc/images")
        os.symlink(os.path.relpath(
            ad3_location + r"/asciidoc3/images", ad3_location + r"/asciidoc3/doc"),
                   ad3_location + r"/asciidoc3/doc/images")

        # <...>/asciidoc3/tests/images --> ../images
        if os.path.exists(ad3_location + r"/asciidoc3/tests/images"):
            os.unlink(ad3_location + r"/asciidoc3/tests/images")
        os.symlink(os.path.relpath(
            ad3_location + r"/asciidoc3/images", ad3_location + r"/asciidoc3/tests"),
                   ad3_location + r"/asciidoc3/tests/images")

        # <...>/asciidoc3/tests/data/images --> ../../images
        if os.path.exists(ad3_location + r"/asciidoc3/tests/data/images"):
            os.unlink(ad3_location + r"/asciidoc3/tests/data/images")
        os.symlink(os.path.relpath(
            ad3_location + r"/asciidoc3/images", ad3_location + r"/asciidoc3/tests/data"),
                   ad3_location + r"/asciidoc3/tests/data/images")

        # <...>/asciidoc3/tests/asciidoc3api.py --> ../asciidoc3api.py
        if os.path.exists(ad3_location + r"/asciidoc3/tests/asciidoc3api.py"):
            os.unlink(ad3_location + r"/asciidoc3/tests/asciidoc3api.py")
        os.symlink(os.path.relpath(
            ad3_location + r"/asciidoc3/asciidoc3api.py", ad3_location + r"/asciidoc3/tests"),
                   ad3_location + r"/asciidoc3/tests/asciidoc3api.py")

        # Set symlinks users home to AsciiDoc3's 'working/config' directories
        # Skip if running as root.
        if USERHOMEDIR != r'/root':
            if os.path.exists(USERHOMEDIR + r"/.asciidoc3"):
                os.replace(USERHOMEDIR + r"/.asciidoc3", USERHOMEDIR + r"/.asciidoc3_backup")
            os.symlink(ad3_location + r"/asciidoc3", USERHOMEDIR + r"/.asciidoc3")

            if os.path.exists(USERHOMEDIR + r"/asciidoc3"):
                os.replace(USERHOMEDIR + r"/asciidoc3", USERHOMEDIR + r"/asciidoc3_backup")
            os.symlink(ad3_location + r"/asciidoc3", USERHOMEDIR + r"/asciidoc3")

        # Adjust path in ./tests/testasciidoc3.py to run tests
        if os.path.exists(ad3_location + r"/asciidoc3/tests/testasciidoc3.py"):
            with open(ad3_location + r"/asciidoc3/tests/testasciidoc3.py", 'r') as testfile:
                file_content = testfile.read()
                file_content = re.sub(r'asciidoc3 = asciidoc3api\.AsciiDoc3API\(\)',
                                      r'# Change path if needed - see ./doc/asciidoc3api.txt!\n'
                                      r'        asciidoc3 = asciidoc3api.AsciiDoc3API("'
                                      + ad3_location + r'/asciidoc3/asciidoc3.py")',
                                      file_content, 1)
            with open(ad3_location + r"/asciidoc3/tests/testasciidoc3.py", 'w') as testfile:
                testfile.write(file_content)

    # ###################################################################
    # Win8, Win10 (Win7 works, but has reached EOL, Win11 not tested yet)
    # ###################################################################
    elif platform.system().lower().startswith(r"win"):
        if USERHOMEDIR.lower().startswith(r'c:\win'):
            sys.exit("FATAL: Do not run as ADMIN! Script does nothing at all.")

        # not using venv -> ad3_location looks like this:
        # 'c:\\users\\<username>\\appdata\\roaming\\python\\python38\\site-packages'
        # and we have a 'Scripts'-directory here:
        # 'c:\\users\\<username>\\appdata\\roaming\\python\\python38\\Scripts'
        if ad3_location.count(r'appdata'):
            # we need modules in dir 'Scripts', that means sources without trailing '.py'
            shutil.copy(ad3_location[:-13] + r"Scripts\asciidoc3.exe",
                        ad3_location[:-13] + r"Scripts\asciidoc3")
            shutil.copy(ad3_location[:-13] + r"Scripts\a2x3.exe",
                        ad3_location[:-13] + r"Scripts\a2x3")

            # AsciiDoc3 distribution, set internal symlinks.
            # <...>/asciidoc3/filters/music/images --> ../../images
            if os.path.exists(ad3_location + r"\asciidoc3\filters\music\images"):
                os.unlink(ad3_location + r"\asciidoc3\filters\music\images")
            os.system(r"mklink /J " + ad3_location+r"\asciidoc3\filters\music\images " + ad3_location+r"\asciidoc3\images")

            # <...>/asciidoc3/filters/graphviz/images --> ../../images
            if os.path.exists(ad3_location + r"\asciidoc3\filters\graphviz\images"):
                os.unlink(ad3_location + r"\asciidoc3\filters\graphviz\images")
            os.system(r"mklink /J "+ad3_location+r"\asciidoc3\filters\graphviz\images "+ad3_location+r"\asciidoc3\images")

            # <...>/asciidoc3/doc/images --> ../images
            if os.path.exists(ad3_location + r"\asciidoc3\doc\images"):
                os.unlink(ad3_location + r"\asciidoc3\doc\images")
            os.system(r"mklink /J "+ad3_location+r"\asciidoc3\doc\images "+ad3_location+r"\asciidoc3\images")

            # <...>/asciidoc3/tests/images --> ../images
            if os.path.exists(ad3_location + r"\asciidoc3\tests\images"):
                os.unlink(ad3_location + r"\asciidoc3\tests\images")
            os.system(r"mklink /J "+ad3_location+r"\asciidoc3\tests\images "+ad3_location+r"\asciidoc3\images")

            # <...>/asciidoc3/tests/data/images --> ../../images
            if os.path.exists(ad3_location + r"\asciidoc3\tests\data\images"):
                os.unlink(ad3_location + r"\asciidoc3\tests\data\images")
            os.system(r"mklink /J "+ad3_location+r"\asciidoc3\tests\data\images "+ad3_location+r"\asciidoc3\images")

            # <...>/asciidoc3/tests/asciidoc3api.py --> ../asciidoc3api.py
            if os.path.exists(ad3_location + r"\asciidoc3\tests\asciidoc3api.py"):
                os.unlink(ad3_location + r"\asciidoc3\tests\asciidoc3api.py")
            os.system(r"mklink /H "+ad3_location+r"\asciidoc3\tests\asciidoc3api.py "+ad3_location+r"\asciidoc3\asciidoc3api.py")

            # make symlink for convenient use
            if os.path.exists(USERHOMEDIR + r"\asciidoc3"):
                if os.path.exists(USERHOMEDIR + r"\asciidoc3_backup"):
                    shutil.rmtree(USERHOMEDIR + r"\asciidoc3_backup")
                os.replace(USERHOMEDIR + r"\asciidoc3", USERHOMEDIR + r"\asciidoc3_backup")
            os.system(r"mklink /J "+USERHOMEDIR+r"\asciidoc3 "+ad3_location+r"\asciidoc3")

            adjust_testad3()

            # make symlink .asciidoc3: mandatory since AsciiDoc3 looks here for config-files
            if os.path.exists(USERHOMEDIR + r"\.asciidoc3"):
                shutil.rmtree(USERHOMEDIR + r"\.asciidoc3")
            os.system(r"mklink /J "+USERHOMEDIR+r"\.asciidoc3 "+ad3_location+r"\asciidoc3")

            # 'c:\\users\\<username>\\appdata\\roaming\\python\\python3.x(y)?\\asciidoc3'
            # we don't need this folder any more
            # Python 3.x (one digit version minor, e.g. "3.8")
            if os.path.exists(ad3_location[:-22]+r"asciidoc3"):
                shutil.rmtree(ad3_location[:-22]+r"asciidoc3")
            # Python 3.xy (two digit version minor, e.g. "3.10")
            if os.path.exists(ad3_location[:-23]+r"asciidoc3"):
                shutil.rmtree(ad3_location[:-23]+r"asciidoc3")

        # using venv -> ad3_location looks like this:
        # 'c:\\users\\username\\<venv-dir>\\lib\\site-packages'
        elif 'lib' in ad3_location.lower():
            # delete dir '..\\site-packages\\asciidoc3'
            for folder in os.listdir(ad3_location[:-17]):
                if folder.lower().startswith('python3'):
                    if os.path.exists(ad3_location[:-17]+folder+r'\site-packages\asciidoc3'):
                        shutil.rmtree(ad3_location[:-17]+folder+r'\site-packages\asciidoc3')
                        if len(list(os.listdir(ad3_location[:-17]+folder))) == 1:
                            shutil.rmtree(ad3_location[:-17]+folder+r'\site-packages')
                            shutil.rmtree(ad3_location[:-17]+folder)

            # we need modules in dir 'Scripts', that means sources without trailing '.py'
            shutil.copy(ad3_location[:-17]+r"Scripts\asciidoc3.exe",
                        ad3_location[:-17]+r"Scripts\asciidoc3")
            shutil.copy(ad3_location[:-17]+r"Scripts\a2x3.exe",
                        ad3_location[:-17]+r"Scripts\a2x3")

            # move folder asciidoc3 to apropriate location
            shutil.move(ad3_location + r"\asciidoc3", ad3_location[:-17] + r"\asciidoc3")

            # make symlink <venv>\asciidoc3
            os.system(r"mklink /J "+USERHOMEDIR+r"\asciidoc3 "+ad3_location[:-17]+r"asciidoc3")

            # AsciiDoc3 distribution, set internal symlinks.
            # <...>/asciidoc3/filters/music/images --> ../../images
            if os.path.exists(USERHOMEDIR + r"\asciidoc3\filters\music\images"):
                os.unlink(USERHOMEDIR + r"\asciidoc3\filters\music\images")
            os.system(r"mklink /J "+USERHOMEDIR+r"\asciidoc3\filters\music\images "+USERHOMEDIR+r"\asciidoc3\images")

            # <...>/asciidoc3/filters/graphviz/images --> ../../images
            if os.path.exists(USERHOMEDIR + r"\asciidoc3\filters\graphviz\images"):
                os.unlink(USERHOMEDIR + r"\asciidoc3\filters\graphviz\images")
            os.system(r"mklink /J "+USERHOMEDIR+r"\asciidoc3\filters\graphviz\images "+USERHOMEDIR+r"\asciidoc3\images")

            # <...>/asciidoc3/doc/images --> ../images
            if os.path.exists(USERHOMEDIR + r"\asciidoc3\doc\images"):
                os.unlink(USERHOMEDIR + r"\asciidoc3\doc\images")
            os.system(r"mklink /J "+USERHOMEDIR+r"\asciidoc3\doc\images "+USERHOMEDIR+r"\asciidoc3\images")

            # <...>/asciidoc3/tests/images --> ../images
            if os.path.exists(USERHOMEDIR + r"\asciidoc3\tests\images"):
                os.unlink(USERHOMEDIR + r"\asciidoc3\tests\images")
            os.system(r"mklink /J "+USERHOMEDIR+r"\asciidoc3\tests\images "+USERHOMEDIR+r"\asciidoc3\images")

            # <...>/asciidoc3/tests/data/images --> ../../images
            if os.path.exists(USERHOMEDIR + r"\asciidoc3\tests\data\images"):
                os.unlink(USERHOMEDIR + r"\asciidoc3\tests\data\images")
            os.system(r"mklink /J "+USERHOMEDIR+r"\asciidoc3\tests\data\images "+USERHOMEDIR+r"\asciidoc3\images")

            # <...>/asciidoc3/tests/asciidoc3api.py --> ../asciidoc3api.py
            if os.path.exists(USERHOMEDIR + r"\asciidoc3\tests\asciidoc3api.py"):
                os.unlink(USERHOMEDIR + r"\asciidoc3\tests\asciidoc3api.py")
            os.system(r"mklink /H "+USERHOMEDIR+r"\asciidoc3\tests\asciidoc3api.py "+USERHOMEDIR+r"\asciidoc3\asciidoc3api.py")

            adjust_testad3()

            # make symlink .asciidoc3: mandatory since AsciiDoc3 looks here for config-files
            if os.path.exists(USERHOMEDIR + r"\.asciidoc3"):
                shutil.rmtree(USERHOMEDIR + r"\.asciidoc3")
            os.system(r"mklink /J " + USERHOMEDIR + r"\.asciidoc3 " + USERHOMEDIR + r"\asciidoc3")

            # make copy <venv>\Scripts python - python3
            if not os.path.exists(ad3_location[:-17] + r"Scripts\python3.exe"):
                os.system(r"copy /Y "+ad3_location[:-17] + r"Scripts\python.exe "
                          + ad3_location[:-17] + r"Scripts\python3.exe")

    # ##########################
    # # neither POSIX or Windows
    # ##########################
    else:
        sys.exit("""\n
                 Your Operating System was not included in this script:
                 you are on your own to handle symlinks ...""")


if __name__ == '__main__':
    main()
