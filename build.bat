@ECHO OFF
REM Delete Javascript files as we will generate them now
DEL LInQer.Enumerable.js
DEL LInQer.extra.js
DEL LInQer.extra.min.js
DEL LInQer.GroupEnumerable.js
DEL LInQer.js
DEL LInQer.min.js
DEL LInQer.OrderedEnumerable.js
DEL LInQer.slim.js
DEL LInQer.slim.min.js

REM Requires npm install typescript -g
call tsc --p tsconfig.json --sourceMap --noResolve
call tsc --p tsconfig.slim.json --sourceMap --noResolve
call tsc --p tsconfig.extra.json --sourceMap --noResolve

REM Delete intermediary Javascript files
DEL LInQer.Enumerable.js
DEL LInQer.GroupEnumerable.js
DEL LInQer.OrderedEnumerable.js

REM Requires npm install terser -g
call terser --compress --mangle -o LInQer.min.js -- LInQer.js
call terser --compress --mangle -o LInQer.slim.min.js -- LInQer.slim.js
call terser --compress --mangle -o LInQer.extra.min.js -- LInQer.extra.js
