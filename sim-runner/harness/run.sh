#!/usr/bin/env bash
# One student run: compile the project as it now stands, then simulate it
# headless with halsim_ws_server on port 3300. No Gradle: bake.sh already
# resolved every dependency and wrote the classpath, so this is javac and java
# against the same jars Gradle would use.
#
# Lines starting with @@ are markers for the Next.js route; everything else is
# compiler or robot output, passed through to the student.
set -uo pipefail

ROOT=${SIM_ROOT:-/vercel/sandbox}
PROJECT=$ROOT/project
RUNTIME=$ROOT/runtime
JDK=$ROOT/jdk
SIM_SECONDS=${SIM_SECONDS:-120}

ms() { echo $(( ($(date +%s%N) - $1) / 1000000 )); }

CP=$(cat "$RUNTIME/classpath.txt")
LIBDIR=$(cat "$RUNTIME/libdir.txt")
mapfile -t JVMARGS < "$RUNTIME/jvmargs.txt"

t0=$(date +%s%N)
rm -rf /tmp/student-classes && mkdir -p /tmp/student-classes
find "$PROJECT/src/main/java" -name '*.java' > /tmp/sources.txt
if ! "$JDK/bin/javac" --release 25 -proc:none -XDstringConcat=inline -Xmaxerrs 20 \
    -cp "$CP" -d /tmp/student-classes @/tmp/sources.txt 2>&1; then
  echo "@@compile-failed $(ms "$t0")"
  exit 2
fi
echo "@@compiled $(ms "$t0")"

# Only the websocket extension: no GUI, no real-driver-station socket.
export HALSIM_EXTENSIONS="$LIBDIR/libhalsim_ws_server.so"
export LD_LIBRARY_PATH="$LIBDIR"
export HALSIMWS_PORT=3300
export HALSIMWS_URI=/wpilibws
# Send the browser SimDevice messages only. Unfiltered, the joystick, CAN and
# driver-station echoes are about 300 KiB/s, and exposed-port traffic is billed.
# Inbound Joystick messages are still accepted.
export HALSIMWS_FILTERS=SimDevice
# halsim_ws serves static files from these roots over HTTP as well as the
# websocket. Point both at an empty directory so the project is not readable
# through the exposed port.
mkdir -p /tmp/empty-webroot
export HALSIMWS_SYSROOT=/tmp/empty-webroot HALSIMWS_USERROOT=/tmp/empty-webroot

echo "@@sim-start"
cd /tmp
exec timeout --signal=TERM --kill-after=5 "$SIM_SECONDS" \
  "$JDK/bin/java" "${JVMARGS[@]}" -Xmx384m -XX:+UseSerialGC \
  -Djava.library.path="$LIBDIR" \
  -cp "/tmp/student-classes:$ROOT/harness/classes:$CP" \
  workshop.sim.SimHarness
