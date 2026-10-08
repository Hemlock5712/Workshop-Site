# Brief: /hardware, "Hardware Setup" (Workshop 1, first lesson)

Page: `src/app/(workshop)/hardware/page.tsx`, 9 minutes, no branch, no code. Pairs with `/project-setup` (`PairedLesson kind="code"`). Order: `/hardware` → `/mechanism-setup` → `/pid-control` → `/motion-magic`.

## 1. Teaches (page order)

- **Three parts**: a motor (Kraken X44, a TalonFX controller built into the back, which runs its own loops a thousand times a second and reports its position, so the motor is also a sensor), a sensor (WCP ThroughBore, a CANcoder inside, absolute, arm only), and a bus to the laptop (CANivore, USB to CAN FD). The flywheel has no CANcoder.
- **The CANivore is why Workshop 1 needs no robot**: laptop → USB → CANivore → devices.
- **Connect Tuner X**: power first, then USB. Check **CANivore USB**, set **Team # or IP** to `localhost`, the CANivore appears, rename it `canivore`, open it and see the motor (and CANcoder) under it.
- **Update the firmware**: select a device, use the **batch update** icon for every device of that model, update the CANivore too, keep everything on one version.
- **Read the card colours**: green latest, yellow update available, purple unexpected/beta, red duplicate ID, blue couldn't fetch the firmware list.
- **Check**: power cycle; name and firmware survive because they live on the devices.

## 2. Format: screen recording, with a 10 s animated opener

Everything after the opener is a procedure in Tuner X. The one idea that needs a picture is the signal path (laptop, USB, CANivore, devices, no robot controller in between), which takes a single animated diagram. A recording can't show a cable's role.

**Shot list** (Tuner X 2026.4.1.0, bench CANivore + one TalonFX):

1. Bench photo or live camera: battery on, USB into the CANivore. Zoom: the USB plug. (Hardware order matters: power first.)
2. Tuner X launch, the connection settings. Click the **CANivore USB** checkbox. Zoom: checkbox.
3. Click into **Team # or IP**, type `localhost`. Zoom: the field as it's typed.
4. Device list populates; the CANivore card appears. Hold 1 s on the card. Zoom: the card.
5. Rename the CANivore: click its name field, type `canivore`, apply. Zoom: the name field, then the card showing `canivore`. **Record this from a CANivore with a different name first** (e.g. a factory name), so the rename is visible. Ours is already `canivore`.
6. Open the CANivore; the TalonFX card shows under it. Zoom: the TalonFX card.
7. Firmware: select the TalonFX, click the **batch update** icon, pick the version, watch progress. Zoom: the icon, then the progress bar. Speed-ramp the flash.
8. Same for the CANivore.
9. Card turns green. Zoom: the card colour and the status text under the device name.
10. Power cycle: battery off, USB out, both back. Tuner X reconnects as `canivore`, card still green. Zoom: the name, then the colour.

Purple, yellow, red, blue can't all be produced on demand. Show them as a still strip of five card colours with the meaning beside each (built from the page table), not faked in Tuner X.

## 3. The concept that needs motion

**The path a message takes.** Laptop → USB → CANivore → CAN FD wire → TalonFX (and CANcoder). Animate one packet travelling it, with a greyed-out "robot controller" slot the packet skips. That's the whole reason Tuner X can drive a motor in this workshop with no robot. It also seeds `canivore` as a name that the code will later need to match exactly (`new CANBus("canivore")`, `/mechanisms`).

## 4. Student knows already / Sets up

- **Knows**: the mechanism is assembled and wired (Mechanism CAD); Tuner X is installed (Prerequisites). Nothing in Tuner X yet.
- **Sets up**: `/mechanism-setup` relies on the device list, the CANivore named `canivore`, and red cards meaning duplicate IDs ("Motor Setup sorts that out"). `/mechanisms` uses `new CANBus("canivore")`, and the brief there quotes "That string has to match the name you gave the CANivore in Tuner X."

## 5. Settings on screen

- **CANivore USB**: checked.
- **Team # or IP**: `localhost`.
- CANivore name: `canivore`.
- Card colour table (page): Green / Yellow / Purple / Red / Blue as above.

No gains, no code.

## 6. Misconceptions / failure modes

- "A CANivore that never shows up is usually running firmware older than the Tuner X you installed."
- Old firmware fails late, not loudly: "A device on old firmware still connects and still answers. It then refuses a configuration, or reports a signal your Phoenix version cannot read."
- "Mixed versions on one bus give you failures that come and go."
- Not obvious: there's no team number and no robot to find. Students who've used Tuner X with a roboRIO will type their team number.

## 7. Interactive moment idea

None needed (recording). If the player wants one: "Which colour?" Five greyed cards, tap one to reveal its meaning.

## 8. Visual pieces needed beyond the kit

- **Signal-path diagram**: laptop, USB cable, CANivore, CAN FD wire, TalonFX, CANcoder (labelled "arm only"), and a dashed empty slot labelled "robot controller (not needed)".
- **Part cards** for Kraken X44, ThroughBore/CANcoder, CANivore: use the page photos `public/images/hardware/*.png`.
- **Card-colour strip** (five Tuner X-style device cards).
- Callout chip "same name in code later" on the `canivore` rename. Don't show the Java.

## 9. Draft beat outline

1. **Name it.** "Every mechanism here is three parts: a motor, a sensor, and a bus to your laptop."
2. **Motor.** Kraken X44 card: "The controller is built into the back, and it reports its own position, so the motor's a sensor too."
3. **Sensor (arm only).** ThroughBore card: "It's absolute. It still knows the arm's angle after the power's been off all week. The flywheel doesn't have one."
4. **Bus.** Signal-path animation: "The CANivore gives the devices their own bus, and your laptop plugs straight into it. No robot needed."
5. **Connect.** Recording shots 1–4: power, USB, CANivore USB, localhost.
6. **Name it `canivore`.** Shot 5. "Every later lesson uses that name. Spell it the same."
7. **Firmware.** Shots 7–8. "Old firmware still connects. It fails later, in ways that come and go. Put everything on one version."
8. **Colours.** Still strip: green, yellow, purple, red, blue. "Red means two devices share an ID. That's the next lesson."
9. **Check.** Shot 10: power cycle, still `canivore`, still green.
10. **Takeaway.** "The name and the firmware live on the devices, so they survive a power cycle."

## 10. Site/branch mismatches

- **The two existing videos look swapped.** `VideoEmbed id="aktcCtcrEyY" title="Motor update process"` sits under **Connect Tuner X**, and `id="TkScJADvD-Y" title="CANivore setup"` sits under **Update the firmware**. The titles suggest the opposite placement.
- `DocumentationButton`, `MarginNote` and `BookOpen` are imported but never rendered. Harmless.
- The page never says where the **batch update** icon is or what it looks like. The recording should zoom on it, and the page could get a screenshot.
- The bench CANivore is already named `canivore`, so the rename has to be staged (rename it to something else first).
- Tuner X "Team # or IP" and "CANivore USB" labels are the page's; confirm against 2026.4.1.0 at capture.
