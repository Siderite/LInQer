@ECHO OFF
REM Requires npm install typescript -g
call tsc --p tsconfig.json --sourceMap --noResolve
call tsc --p tsconfig.slim.json --sourceMap --noResolve
call tsc --p tsconfig.extra.json --sourceMap --noResolve
REM Requires npm install terser -g
call terser --compress --mangle -o LInQer.min.js -- LInQer.js
call terser --compress --mangle -o LInQer.slim.min.js -- LInQer.slim.js
call terser --compress --mangle -o LInQer.extra.min.js -- LInQer.extra.js