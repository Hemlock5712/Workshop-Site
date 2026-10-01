# Running real robot code from the site: spike results

October 2026. Two ways for a student to build and simulate the lesson's Java
with real WPILib 2027 alpha-7 and Phoenix 6 `26.70.0-alpha-2`, nothing faked:
a Codespace (phase 1) and an in-page editor backed by Vercel Sandbox (phase 2).
Every number below was measured in this spike unless it says otherwise.

## Verdict

- **Codespaces: go.** It costs the team nothing, because the Codespace bills
  the student's own GitHub allowance. Before linking it from more than one
  lesson, rebase the mech chain onto the `devcontainer` commit and turn on
  prebuilds. Without prebuilds, the first open builds a 4.6 GB image.
- **In-page sandbox: go for a pilot on Pro, no-go on Hobby.** It works end to
  end with real alpha-7 code, at about $0.004 a run. Hobby allows 10
  concurrent sandboxes and 5 CPU-hours a month, and pauses creation for the
  rest of the cycle once that is spent. That fails a room of 30 students on
  the first night. The team plan was not readable through the API. The name
  "Joe Lockwood's projects" suggests Hobby.

## What the alpha actually ships

| Question                               | Answer                                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| halsim_ws in alpha-7?                  | Yes. `halsim_ws_server` / `_client` `2027.0.0-alpha-7` for `linuxx86-64`, in frcmaven `release`. It is not in `release-2027`, whose metadata stops at alpha-6.                                                                             |
| Phoenix 6 sim natives on Linux x86-64? | Yes. A JUnit test in a Linux container loaded HAL, built the real `Arm` and `Flywheel`, and a sim TalonFX answered over the simulated CANivore (`os.arch=amd64`). The same natives ran the robot in Vercel Sandbox (Ubuntu 26.04, x86_64). |
| `./gradlew simulateJava`?              | **The task does not exist in GradleRIO alpha-7.** Gradle's name matching runs `simulateExternalJava` instead, which only writes `build/sim/java.json` and exits. Command-line sim is `./gradlew run`.                                      |
| Sim GUI on Linux?                      | Renders on the noVNC desktop. halsim_gui is SDL in alpha-7 and falls back to its 2D renderer with no GPU.                                                                                                                                  |

## Phase 1: dev container

On Workshop-Code: `devcontainer` (one commit on `main`) and
`mech-3-MotionMagic-devcontainer` (the lesson plus that commit). Neither
existing branch was touched.

- Temurin 25.0.4.1+1, the JDK the WPILib installer ships, SHA-checked, at the
  path the WPILib extension expects. The alpha-7 extension `.vsix` is baked
  into the image, because the Marketplace copy stops at 2023. `desktop-lite`
  provides noVNC on 6080. The Gradle cache is warmed against the branch's own
  build.
- Verified in a local Docker build with `@devcontainers/cli`, the engine
  Codespaces uses: `build` (offline), `test`, and `run` with the GUI on the
  virtual desktop, screenshot included. Cold image build: 332 s. Image:
  4.57 GB, of which the Gradle cache is 944 MB.
- **Verified in a real Codespace** (4-core, no prebuild). Results:
  - Cold open took 208 s the first time and 255 s the second.
  - `build --offline` took 16 s and `test --offline` passed. The test was a
    throwaway JUnit test that loads Phoenix's sim natives (`amd64`).
  - `run` reached "Robot program startup complete" with halsim_gui loaded.
  - noVNC answered on 6080.
  - The Codespace billed the creating user's own allowance.
  - `gh codespace ssh` needed the `sshd` feature, which is now in the
    container. A browser Codespace never needed it.
- Bugs found and fixed in the commit:
  - `gradlew` had no executable bit, so `./gradlew` failed with "Permission
    denied" on every Linux or macOS checkout.
  - A Windows checkout mounted into a container failed with
    `./gradlew: not found` because of CRLF. `.gitattributes` now pins LF.
  - No branch has tests, so `test` reported NO-SOURCE and JUnit was never
    cached. The warm step now adds a throwaway test.
- Site: `OpenInCodespaces`, driven by `PageTemplate`'s `branch` prop, shown
  only for branches listed in `src/data/codespaces.ts`. A branch without a dev
  container would boot GitHub's default image, which has no JDK 25.

## Phase 2: in-page editor and sandbox

Flow: Monaco loads the branch's files through `/api/github`. Run posts one file
to `/api/sim/run`, which boots a sandbox from a snapshot, writes the file, runs
`sim-runner/harness/run.sh`, and streams NDJSON. When the robot is enabled, the
browser opens the sandbox's halsim_ws socket directly. Telemetry arrives as a
HAL SimDevice, and the hold buttons send halsim_ws `Joystick` messages.

The lesson branches have no sim physics, so a plain sim never moves.
`sim-runner/harness` adds it from outside the student's project: WPILib
`SingleJointedArmSim` and `FlywheelSim` (Kraken X44, 28.125:1, 2 kg at 0.4 m;
0.01 kg·m² wheel, the playgrounds' numbers) drive Phoenix's `TalonFXSimState`
and `CANcoderSimState`. Teleop is selected through `DriverStationSim`. No line
of the student's code changes.

Results with the code as shipped:

- `mech-3`'s arm holds still, because every gain is 0.0. That is what the
  lesson says a fresh clone does.
- With tuned gains pasted in, holding the left trigger swings the arm 0.5 →
  0.25 rotations in about 1.5 s.
- **`Flywheel.java` ships `kV = 0.125`, the Kraken X60's value.** With
  `kP = 0`, the simulated X44 runs to about 101 rps against a 75 rps target.
  The X44 needs about 0.093.

### Latency

| Step                                     | 1 vCPU       | 2 vCPU |
| ---------------------------------------- | ------------ | ------ |
| Sandbox create from 2.1 GB snapshot      | 2.5 s        | 1.9 s  |
| javac, all 7 files, cold                 | 1.94 s       | 1.23 s |
| Robot enabled, from run start, cold      | 3.17 s       | 1.93 s |
| Robot enabled, re-run in the same box    | not measured | 1.51 s |
| Websocket open, Windows client to `iad1` | 0.27–0.61 s  | same   |

That puts Run-to-moving at about 6 s on 1 vCPU and about 4.5 s on 2 vCPU,
summed from the steps. **It has not been measured through the route yet**,
because local SDK auth is missing. Gradle instead of javac would add about 6 s
(`build --offline`: 6.9 s against 0.77 s for javac on 4 vCPU), so `run.sh`
skips Gradle and compiles against the classpath Gradle resolved at bake time.
Baking takes 29.5 s on 4 vCPU.

### Memory and bandwidth

- Robot JVM: 141–183 MB RSS. Whole VM: 399 MB of 4 GB. On 1 vCPU the 20 ms
  loop holds after one first-loop watchdog warning.
- halsim_ws unfiltered sends about 335 KiB/s, mostly joystick and CAN
  echoes. `HALSIMWS_FILTERS=SimDevice` cuts that to 25–27 KiB/s, about 3 MB a
  run, and joystick input still gets in.

### Cost, Pro rates, `iad1`

One 2-minute run on 1 vCPU / 2 GB:

| Item                                                         | Cost                                      |
| ------------------------------------------------------------ | ----------------------------------------- |
| Active CPU, about 34 s (Vercel metered 15.3 s per 52 s wall) | $0.0012                                   |
| Memory, 2 GB × 3 billed minutes                              | $0.0021                                   |
| Creation                                                     | ≈ $0                                      |
| Transfer, about 3 MB                                         | in Pro's CDN rate, or $0.0005 at $0.15/GB |
| Function holding the stream, upper bound                     | about $0.0007                             |

That is about **$0.004 a run**, or about **$0.025 a student-session** of six
runs. A workshop night of 30 students costs about $0.75. Each lesson branch's
snapshot is 2.1 GB, about $0.17 a month. Pro's $20 monthly credit covers about
5,000 runs.

## Abuse limits as built

- **Network:** `deny-all`. Verified from inside: `curl` gets "Could not resolve
  host", and DNS is blocked. Inbound to the exposed port still works.
- **Time:** the sim is killed at 120 s, the sandbox times out at 150 s, the
  function stops at 300 s, and the sandbox stops as soon as the response ends,
  including a closed tab.
- **Box:** 1 vCPU, 2 GB, `persistent: false`. A fork bomb or infinite loop
  only burns its own VM until the timeout.
- **Input:** one of three allowlisted files, 64 KB of source, 64 KB of
  forwarded log.
- **Rate:** 8 concurrent runs and 60 runs per IP per 10 minutes, kept in
  function memory. That is best effort on Fluid, and deliberately loose,
  because a classroom shares one NAT. Production needs a shared counter and a
  Vercel Firewall rate-limit rule on `/api/sim/*`.
- **Exposure:** halsim_ws has no auth. Anyone holding the unguessable sandbox
  URL could drive that one sim for its 2 minutes, and halsim_ws accepts one
  client. Its static-file roots point at an empty directory, so the project
  is not readable over the port.

## Before this ships

1. Measure Run-to-moving through the route on a preview deployment.
2. Turn on Codespaces prebuilds for the lesson branches, to cut the 3.5 to
   4 minute cold open.
3. Rebase the mech chain onto `devcontainer`, then empty the map in
   `src/data/codespaces.ts`.
4. Bake one snapshot per lesson branch, in CI, whenever Workshop-Code moves.
   Snapshots expire after 7 days unless an expiration is set.
5. Replace the in-memory limits with the shared counter and the firewall rule.
6. Have a mentor check the harness physics against the bench. It is the
   playgrounds' model, with no arm friction.
