# Brief: /mechanisms (Workshop 3, "Mechanisms")

Page: `src/app/(workshop)/mechanisms/page.tsx`, branch `mech-1-Mechanisms`, 14 minutes. Written once and read twice: the student picks Arm or Flywheel at the top. Order: `/project-structure` → `/git-workflow` → **`/mechanisms`** → `/adding-commands` → `/opmodes` → `/running-program`.

## 1. Teaches (page order)

- A mechanism is one physical part, written as one class that `implements Mechanism`. Its hardware is in `private final` fields: a `CANBus("canivore")`, a `TalonFX`, and a `CANcoder` for the arm only. A `VoltageOut` request is built once as a field.
- **Configure the motor once**: paste the Tuner X **Generate Code** config into the constructor, then `motor.getConfigurator().apply(talonFXCfg)`. NeutralMode (Coast) is the only choice. Inverted was settled on the bench. The Expo lines are defaults and get ignored.
- Arm only: `withFeedback` makes the absolute CANcoder the motor's position source.
- **Two methods**, both private: `setVoltage` and `stopMotor`.
- **Configs and requests**: a config is settings the TalonFX saves, applied once. A request is what to do right now, sent every loop, and it **stays latched**. The request names form a grid: output column times target row, plus a MotionMagic prefix.
- **Hand it to Robot**: `public final Arm arm = new Arm();`, built once at startup and handed to every OpMode.

## 2. The concept that needs motion

**Config versus request: two kinds of message to the same motor.** On the page it's two paragraphs and a table. In motion it's two different pulses down the CAN wire. The config packet goes once, at construction, and fills the TalonFX card's settings panel, which stays filled. Request packets keep coming, and the "current request" slot on the card shows whatever arrived last. This page names the concept that `/running-program` later demonstrates (latched), so it's the setup for the finished reference video. Introduce latching here in one line and leave the full demo to that video.

**Second idea, arm only: why the CANcoder is in the loop.** Power on an arm sitting at 40°. The rotor counter reads 0 and the CANcoder reads 40°. Flip `withFeedback` on and the motor's position readout snaps to the arm's real angle. Prose can't make "measured from wherever it sat at power-on" land the way one power cycle on screen does.

Optional third idea, a still with a little motion: the request-name grid, where picking a row and a column assembles the name (Velocity + Voltage = `VelocityVoltage`).

## 3. Student knows already / Sets up

- **Knows**: CAN IDs 31 (arm motor), 32 (CANcoder), 21 (flywheel) and the `canivore` bus name, from `/mechanism-setup`. That's also where the Tuner X **Control** drop-down (Voltage Out) and linking the encoder come from. The config panel is from `/pid-control` and `/motion-magic`. The project structure and the `mechanisms` folder location come from `/project-structure`.
- **Sets up**: `/adding-commands` wraps `setVoltage` and `stopMotor` in `runSlow`, `runFast` and `stop` with `runRepeatedly(...).named(...)`, and the helper is already called `stopMotor` so that `stop` is free. `/running-program#latched` demos the latched request. `/motion-magic-code` swaps `VoltageOut` for `MotionMagicVoltage` and starts reading the gains.

## 4. Code on screen (branch `mech-1-Mechanisms`, `src/main/java/first/robot/mechanisms/Arm.java`)

```java
public class Arm implements Mechanism {
  private final CANBus canivore = new CANBus("canivore");
  private final TalonFX motor = new TalonFX(31, canivore);
  private final CANcoder encoder = new CANcoder(32, canivore);

  // Pushes a set voltage at the motor. No sensors involved.
  private final VoltageOut voltageOut = new VoltageOut(0);

  public Arm() {
    final TalonFXConfiguration talonFXCfg =
        new TalonFXConfiguration()
            .withMotorOutput(
                new MotorOutputConfigs()
                    .withNeutralMode(NeutralModeValue.Coast) // easy to move by hand
                    .withInverted(InvertedValue.CounterClockwise_Positive))
            .withMotionMagic(/* two Expo defaults, ignored */)
            .withFeedback(
                new FeedbackConfigs()
                    .withFeedbackRemoteSensorID(32)
                    .withFeedbackSensorSource(FeedbackSensorSourceValue.RemoteCANcoder));

    motor.getConfigurator().apply(talonFXCfg);
  }

  private void setVoltage(double voltage) {
    motor.setControl(voltageOut.withOutput(voltage));
  }

  private void stopMotor() {
    motor.stopMotor();
  }
}
```

Flywheel (same branch, `Flywheel.java`): `new TalonFX(21, canivore)`, no CANcoder, no `withFeedback`, `InvertedValue.Clockwise_Positive` with the comment `// positive shoots: clockwise from the motor side`.

`Robot.java` (same branch):

```java
public final Arm arm = new Arm();
public final Flywheel flywheel = new Flywheel();
```

Don't put tuned gains on screen. Per the page, the config block "is the shape, not a config to copy".

## 5. Misconceptions / failure modes

- Bus name: "That string has to match the name you gave the CANivore in Tuner X. Spell it differently and nothing answers."
- CAN IDs: "Do not leave the two disagreeing."
- Leaving out `withFeedback`: "every angle you ask for later is measured from wherever the arm sat at power-on."
- Brake vs Coast: "A competition arm carrying weight usually wants Brake, or it drops the instant you disable."
- Latched: "The motor keeps applying the last one it received until a different one arrives, even after the code that sent it has stopped running." Quiz Q4: 6 V sent once means 6 V forever, not one 20 ms loop.
- Building only one mechanism: delete the other field and its import, or it doesn't compile.

## 6. Interactive moment

**The power cycle (arm).** The narration pauses with the arm on its stand. The student drags the arm to any angle by hand (Coast, so it moves freely), then presses a power button. Two readouts reset: the rotor count snaps to 0, while the CANcoder keeps the real angle. A toggle labelled "CANcoder in the loop" (the `withFeedback` lines highlight) switches the motor's position readout between the two. For flywheel viewers, a fallback: spin the wheel by hand and power-cycle, and the speed reads right either way, which is why the flywheel has no CANcoder.

## 7. Visual pieces needed beyond the kit

- The TalonFX card split into two zones: a **Config** panel (persistent settings: Neutral, Inverted, Feedback source) and **Current request** (the existing slot).
- A CAN wire with two packet styles: a one-shot config packet and repeating request packets.
- A CANcoder device beside the arm, with an absolute-angle readout and a rotor-count readout.
- A power-cycle control with a brief blackout.
- The request-name grid (5 rows × 3 columns) with a row/column highlight.
- A Tuner X config panel with **Generate Code** for the "connect to Workshop 1" beat.

## 8. Draft beat outline

1. Name it: "A mechanism is one part of the robot, written as one class."
2. Connect: the Tuner X config panel from Workshop 1, three dots, Generate Code, and the paste lands in the constructor.
3. Fields light up one by one: the bus, the motor at 31, the CANcoder at 32, one voltage request built once.
4. The constructor runs: one config packet goes down the wire, the settings panel fills and stays filled.
5. Coast versus Brake: nudge the arm, it swings freely. That's the one choice in the config.
6. Your turn: drag the arm, power-cycle it, and see the rotor say zero while the CANcoder knows the angle.
7. Toggle the feedback lines: the motor's position snaps to the real angle. That's why those lines stay in.
8. Config versus request: request packets keep arriving and the current-request slot shows the latest one. "A request sticks until another one replaces it." That's a pointer to the Hardware Simulation video.
9. The grid: Voltage Out is this cell; Motion Magic Voltage, two lessons from now, is this one.
10. Robot builds the arm once, as a field, and every mode gets the same arm.
11. Takeaway: "Settings go in once. Requests go every loop, and the last one sticks."
