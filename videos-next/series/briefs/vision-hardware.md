# Brief: /vision-hardware, "Vision Hardware" (Workshop 6, first lesson)

No branch, no Java, on purpose. Page `time="12 minutes"`. Followed by /vision-implementation, which needs the camera mounted, calibrated and its **name** written down.

## 1. Teaches (page order)

- **Tags against drift**: odometry adds up wheel turns, so every skid stays in the total and nothing notices. An AprilTag has an ID; the field map says where each sits. Solving the tag's corners gives a pose that "owes nothing to how long the robot has been driving." It is "occasional and noisy, so it does not replace odometry."
- **The camera**: a Limelight, camera and processor in one unit, set up through its own web page. PhotonVision named once, not compared.
- **Mounting and wiring**: power from a dedicated PDH breaker (not the VRM), Ethernet to the radio or a switch, and **never level**: off to one side, above or below the tags. Square-on is the worst pose a tag gives.
- **Set the camera up**, in order: update OS + upload field map; pipeline to AprilTag; exposure as low as still finds tags; camera offsets; ChArUco lens calibration; write down the name (default `limelight`). Glue the lens.
- **Check**: printed tag at about a metre; ID drawn, distance matches tape, botpose moves smoothly. Three readings: no ID, distance out by a factor, drift at the frame edge.

## 2. Format

**Hybrid: animated concept, then a Limelight web UI screen recording.** "Never level" and "drift accumulates, a tag doesn't" are geometric ideas a moving picture carries. The six setup steps are clicks in the Limelight web interface, so record them.

**Shot list (Limelight web UI, laptop on the robot network, browse to the camera's address):**

1. Dashboard loads with the live image. Zoom: the stream and the camera name / hostname field.
2. Field map: the 3D / AprilTag settings area → upload the current season's `.fmap`. Zoom: the upload control and the confirmation. (Verify exact panel name on the current Limelight OS; the page names only "upload the field map ... through the web interface".)
3. Pipeline type → **AprilTag**. Zoom: the drop-down.
4. Input tab → **Exposure** slider dragged down until the image is dark but the tag outline still draws. Zoom: slider plus image; show the tag still detected.
5. Camera offsets in robot space (forward, side, up, roll, pitch, yaw). Zoom: the six fields as each is typed. Use made-up round values; these are this robot's measurements, not something to copy.
6. Calibration: ChArUco board held in view, frames captured, result accepted. Zoom: capture counter and the reprojection result. Cut hard; it is long in real time.
7. Name: zoom on the hostname/name field reading `limelight`. Caption: "Write this down."
8. Check: printed tag held about 1 m in front; zoom to the tag ID overlay and the distance/botpose readouts while the tag moves left, right, nearer, further.

The OS update over USB is a separate tool and a long wait; show it as one title card, not footage.

## 3. The concept that needs motion

**Two errors with different shapes over time.** On the field drawable, the real robot drives a loop while an odometry ghost slowly peels away (error grows with time, never shrinks). Tag sightings appear as scattered dots: noisy, occasional, but centred on the truth no matter how long the match has run. Prose says "drift" and "absolute"; the moving picture shows one error growing and the other staying a fixed-size cloud.

**Why "never level."** A tag seen square-on is a plain square; nudge one corner by a pixel and the solved camera position swings wide. Seen from off to one side and above, the same tag is a trapezoid, and the same one-pixel nudge barely moves the answer. A small 3D camera-and-tag scene with a draggable camera position makes this directly.

## 4. Student knows already / sets up

- **Knows:** odometry and why it goes wrong, and "Two fixes, and they are the next pages" (/swerve-prerequisites); blue-corner origin; `Drivetrain/Pose` from /swerve-drive-tuning; just drove PathPlanner autos that depend on the pose (/pathplanner).
- **Sets up:** /vision-implementation: the camera's name string for `Vision.registerAll`, offsets correct so poses aren't shifted, an AprilTag pipeline that publishes a botpose, and the blend of odometry with sightings ("The next lesson blends the two").

## 5. Code or settings on screen

No code. Settings, as the page names them:

- Power: **PDH, dedicated breaker**, 12 V. Not the VRM.
- Network: **Ethernet** to radio or switch.
- Pipeline: **AprilTag**.
- Exposure: "as low as it goes while the camera still finds tags."
- Camera offsets: position and angle relative to robot centre.
- Lens: **ChArUco** calibration.
- Name: default `limelight`.

Do not add parts to the wiring beyond what the page lists.

## 6. Misconceptions / failure modes

- Vision replaces odometry (quiz 1): it is "absolute... often noisier than odometry frame to frame."
- Mounting level and square-on for a clean view (quiz 2): "the worst pose a tag can produce."
- Uniform shift of every pose (quiz 3) = offsets wrong. "every measurement shifts the same way."
- Distance off by a factor (quiz 4) = tag size in the pipeline doesn't match the printed tag.
- No ID at all (quiz 6) = wrong pipeline type, or exposure so low the tag is black.
- Correct up close, drifts toward the frame edge = lens calibration.
- Last season's map: "reports confident nonsense."
- A lens that walks under vibration "takes the calibration with it and nothing on the driver station says so."

## 7. Interactive moment idea

**"Move the camera."** A top-down + side inset of a camera and one tag, with a translucent cloud showing the spread of solved robot positions from one-pixel corner noise. The viewer drags the camera: straight-on and level, the cloud is a long smear; off to one side and above, it tightens to a small blob. Narration waits until they've found the tight spot.

## 8. Visual pieces needed beyond the kit

- **Field + robot drawable** (see autonomous.md) with an **odometry ghost** that can drift from the true robot, and **sighting dots** that pop in and fade.
- **AprilTag glyph** with an ID number, renderable in perspective (square vs trapezoid), corners marked.
- **Camera icon** with a view cone, placeable in height and angle; a **pose-uncertainty cloud** that scales with viewing angle.
- **Robot wiring sketch**: PDH with one breaker highlighted, Ethernet line to radio. Generic boxes, nothing beyond what the page lists.
- **Lens-distortion grid** bending at the edges, for the ChArUco step.

## 9. Draft beat outline

1. **Callback.** "Your autos trust `Drivetrain/Pose`. Every skid goes into it and stays there."
2. **Drift vs absolute.** Odometry ghost peels away; tag sightings scatter around the truth.
3. **What a tag is.** An ID and a known place on the field; the camera solves its corners back to a pose.
4. **Not a replacement.** "Occasional and noisy." Next lesson blends the two.
5. **Mount it.** PDH breaker, Ethernet, aimed at the scoring tags while you're scoring.
6. **Never level.** Square vs trapezoid, the error cloud.
7. **Your turn.** Drag the camera until the cloud is tight.
8. **Set it up** (recorded). Map, AprilTag pipeline, exposure down, offsets, ChArUco, name.
9. **Glue the lens.**
10. **Check** (recorded). Tag at a metre; ID, distance, smooth botpose.
11. **Three readings.** No ID, distance by a factor, drift at the edge.
12. **Hand-off.** "Write down the name. Next, the code that feeds these sightings into the pose."

## 10. Site/branch mismatches

- **The setup procedure never sets the tag size**, but the check section and quiz 4 diagnose "the tag size in the pipeline does not match the tag you printed." A student following steps 1 to 6 has never seen that field. Add a step (or fold it into step 2), or the video's failure reading has no setup beat to point back to.
- The exact Limelight web UI labels (field map upload location, pipeline type value, offset field names) are not on the page and could not be verified here; confirm on the current Limelight OS before recording.
- No branch, correctly; this page has no code.
