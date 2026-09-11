@echo off
@rem ==========================================================================
@rem  Lightweight Maven bootstrap for the Fida Bet backend.
@rem  On first run it downloads Apache Maven into %USERPROFILE%\.m2\wrapper
@rem  (no global install or admin rights needed), then runs it.
@rem  Usage:  mvnw.cmd spring-boot:run
@rem ==========================================================================
setlocal

set "MAVEN_VERSION=3.9.9"
set "BASE_DIR=%USERPROFILE%\.m2\wrapper"
set "MAVEN_HOME=%BASE_DIR%\apache-maven-%MAVEN_VERSION%"
set "MVN_EXEC=%MAVEN_HOME%\bin\mvn.cmd"
set "ZIP=%BASE_DIR%\maven-dl.zip"
set "DIST_URL=https://dlcdn.apache.org/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip"
set "ARCHIVE_URL=https://archive.apache.org/dist/maven/maven-3/%MAVEN_VERSION%/binaries/apache-maven-%MAVEN_VERSION%-bin.zip"

if not exist "%MVN_EXEC%" (
  echo [mvnw] Apache Maven %MAVEN_VERSION% not found - downloading once, please wait...
  if not exist "%BASE_DIR%" mkdir "%BASE_DIR%"
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; try { Invoke-WebRequest -UseBasicParsing -Uri '%DIST_URL%' -OutFile '%ZIP%' } catch { Invoke-WebRequest -UseBasicParsing -Uri '%ARCHIVE_URL%' -OutFile '%ZIP%' }; Expand-Archive -Path '%ZIP%' -DestinationPath '%BASE_DIR%' -Force; Remove-Item -Force '%ZIP%'"
)

if not exist "%MVN_EXEC%" (
  echo [mvnw] ERROR: could not download Maven automatically.
  echo [mvnw] Check your internet connection, or install Maven manually and use 'mvn' instead.
  exit /b 1
)

call "%MVN_EXEC%" %*
