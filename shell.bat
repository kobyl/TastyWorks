@echo off

set root=%~dp0
set user=%username%
set usrMacro=macros.personal
set defMacro=macros.default

if not exist %root%usr\%user% (call :createMacros)

rem stuff we'll need if/when we start building cordova.
rem set ANDROID_HOME=%~dp0\ext\android-sdk-windows
rem set BUILD_TOOLS=%android_home%\build-tools\23.0.2
rem set PATH=%ANDROID_HOME%\platform-tools;%PATH%

pushd %root%

echo Starting marcos in %root%usr\%user%\%usrMacro%
doskey /macrofile=%root%usr\%user%\%usrMacro%

if "%JAVA_HOME%"=="" (call :setHome)
goto:eof

:createMacros
setlocal
echo No macros found for user, creating defaults in %root%usr\%user%.
mkdir  %root%usr\%user%
copy %root%%defMacro% %root%usr\%user%\%usrMacro%
endlocal

:setHome
echo Setting Java home...
set JAVA_HOME=%~dp0ext\jdk7
set PATH=%JAVA_HOME%\bin;%PATH%
EXIT /b 0


