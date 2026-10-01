#!/usr/bin/env bash
# Bake the simulation runner. Runs once, in a fresh Linux x86-64 box with
# network access; the result is snapshotted and every student run starts from
# that snapshot with the network off.
#
# Leaves under $SIM_ROOT:
#   jdk/        Temurin 25.0.4.1+1, the JDK the WPILib alpha-7 installer ships
#   project/    the lesson branch, built once (so ~/.gradle holds every dependency)
#   runtime/    classpath, JVM flags and native dir for a Gradle-free launch
#   harness/    SimHarness + Plant, compiled against the project
set -euo pipefail

ROOT=${SIM_ROOT:-/vercel/sandbox}
BRANCH=${BRANCH:-mech-3-MotionMagic}
REPO=${REPO:-https://github.com/Hemlock5712/Workshop-Code.git}
JDK_BASE="https://github.com/adoptium/temurin25-binaries/releases/download/jdk-25.0.4.1%2B1"
JDK_FILE="OpenJDK25U-jdk_x64_linux_hotspot_25.0.4.1_1.tar.gz"

ms() { echo $(( ($(date +%s%N) - $1) / 1000000 )); }
t0=$(date +%s%N)

if [ ! -x "$ROOT/jdk/bin/java" ]; then
  curl -fsSL -o /tmp/jdk.tgz "$JDK_BASE/$JDK_FILE"
  echo "$(curl -fsSL "$JDK_BASE/$JDK_FILE.sha256.txt" | cut -d' ' -f1)  /tmp/jdk.tgz" | sha256sum -c -
  mkdir -p "$ROOT/jdk"
  tar -xzf /tmp/jdk.tgz --strip-components=1 -C "$ROOT/jdk"
  rm /tmp/jdk.tgz
fi
echo "@@bake jdk $(ms "$t0")"

if [ ! -d "$ROOT/project/.git" ]; then
  git clone --quiet --depth 1 --branch "$BRANCH" "$REPO" "$ROOT/project"
fi
cd "$ROOT/project"
sed -i 's/\r$//' gradlew
chmod +x gradlew
echo "@@bake clone $(ms "$t0")"

export JAVA_HOME="$ROOT/jdk"
SIM_RUNTIME_DIR="$ROOT/runtime" ./gradlew --no-daemon --quiet \
  -I "$ROOT/harness/headless.init.gradle" build writeSimRuntime
echo "@@bake gradle $(ms "$t0")"

rm -rf "$ROOT/harness/classes"
"$ROOT/jdk/bin/javac" --release 25 -proc:none -d "$ROOT/harness/classes" \
  -cp "$(cat "$ROOT/runtime/classpath.txt"):$ROOT/project/build/classes/java/main" \
  $(find "$ROOT/harness/src" -name '*.java')
chmod +x "$ROOT/harness/run.sh"
echo "@@bake harness $(ms "$t0")"

test -f "$(cat "$ROOT/runtime/libdir.txt")/libhalsim_ws_server.so"
echo "@@bake done $(ms "$t0")"
