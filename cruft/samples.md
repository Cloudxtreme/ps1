# Sample Bash Prompts and Minilanguage Snippets


## Colors for hostname and root


- User sets colors for specific hostnames
- User sets color for root
- http://stackoverflow.com/questions/103857/what-is-your-favorite-bash-prompt

### Hand Crafted Bash
~~~~~

# I'll need some sort of state variables, e.g., color
# settings.
# Color the hostname
if [ $HOSTNAME = 'claudius' ]; then
    export HOST_COLOR="\[\033[1;36m\]"
fi
if [ $HOSTNAME = 'drooble' ]; then
    export HOST_COLOR="\[\033[1;34m\]"
fi
if [ $HOSTNAME = 'davinci' ]; then
    export HOST_COLOR="\[\033[1;31m\]"
fi

# Color the colon red if root
COLON_COLOR='0m'
if [ ${UID} -eq 0 ]; then
    COLON_COLOR='1;31m'
fi

PS1=`echo -ne "$HOST_COLOR\h\[\033[00m\]\[\e[$COLON_COLOR\]:\[\033[01;32m\]\w\[\033[00m\]\\[\033[01;33m\]\$\[\033[00m\] "`
~~~~~


### My Minilanguage:
~~~
# snippet:  Hidden directory names

SET HOSTCOLOR TO PICK .hostname ['claudis': .cyan, 'drooble': .magenta, 'davinci': .blue, .default: .orange]
SET HOSTNAME TO PICK .hostname [.blank: ['claudis', 'drooble', 'davinci'], .default: .default]
SET COLONCOLOR TO PICK .whoami  ['root': .red, 'merriam': .green, .default: .yellow]
PROMPT IS HOSTCOLOR HOSTNAME COLONCOLOR .white ':' .dir .dollar
~~~
or
~~~
SET PROMPT TO PICK .hostname {claudis: .cyan(.dir), drooble: .magenta(.dir), davinci: blue(.dir), other: .orange(.hostname .dir)} PICK .user{root:.red(':'), other:.green(':')}
~~~

### My JavaScript Object:
~~~
const coloredHost = [
  { type: 'set',
    id: 'hostcolor',
    value: {
      pick: {
        lookup: '.hostname',
        values: {
          claudis: '.cyan',
          drooble: '.magenta',
          davinci: '.blue',
        },
        default: '.red',
      } } },
  { type: 'set',
    id: 'hostname',
    value: {
      pick: {
        lookup: '.hostname',
        blank: ['claudis', 'drooble', 'davinci'],
        default: '.hostname',
      } } },
  { type: 'set',
    id: 'coloncolor',
    value: {
      pick: {
        lookup: '.whoami',
        root: '.red',
        merriam: '.green',
        default: '.yellow',
      } } },
  { type: 'prompt',
    value:
      ['hostcolor', 'hostname', 'coloncolor', ':', '.white', '.dir', '.dollar'],
  },
];
~~~

### My thoughts

There are three main components:
- Minilanguage:  the user entered strings, everything the user sees about the items.  It is an LL1 grammar, allows Snippets to be readable, would like syntax highlighting, would like syntax clues.  
  - The snippet bank holds snippets of these.  For the MVP, they just insert text.  I could see them having a fill-in-the-form functionality.
  - Full documentation and grammar
  - Test for each aspect of the grammar
  - A syntax highlighting feature or "here's the bug" feature.
- The Object:
  - An array of clauses with a final Prompt clause.
  - Contains exactly the same information as the minilanguage, but in different form.
  - Converting from minilanguage to object can simply pass a 'not parsed' error back, or maybe pass back the highlighting to date.   The idea is that a good parse either happens or it doesn't.
  - See how to make an observable for the good object.
- The output
  - The primary outputs are reformatted text, a sample, and syntax highlighting.
  - This is main internal data structure generated
  - Converting from object is likely to be a tree walk having subclasses for each type of output.
  - Tests will include little tests for each object snippet type and one or two major tests.

# The Minilanguage

The minilanguage has a few base elements:
- Atoms, usually starting with a .
  - colors: .red, .green, .yellow, .magenta,
      .bold, .underline, more?
  - wrappers of the bash characters
      .hostname, .dir, .basedir, .user, more?
  - source control and other special features
      .branch, etc.
  - shell variables or even shell functions
      $branch, $yarn
  - expressions:  .other
- Expression syntax
  - PICK, Lists
- Variable names:
  - not case/underscore sensitive, no initial dots, set with set
  - environment variables and GIT commands are different.  Also Python virtual envs.  

# Strategy:
  Absolute Minimum Project:
     - A text area page; a minilanguage with three colors, hostname, dir, userid, and character literal; an output PS variable line; and a preview.
     - tests include:
         - straight test of hostname, dir, userid, and literal in preview and in PS.
         - parse and fail to parse
         - Everything is one simple line.
         - start with:
             - functions and their meanings
     Now add features one by one...

         literals with colors as PS and variables


       parsing
