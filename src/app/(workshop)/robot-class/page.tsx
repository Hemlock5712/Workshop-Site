import PageTemplate from "@/components/PageTemplate";
import LessonSection from "@/components/lesson/LessonSection";
import KeyConceptSection from "@/components/KeyConceptSection";
import CodeBlock from "@/components/CodeBlock";
import Box from "@/components/Box";
import { MarginNote, Split } from "@/components/lesson/Prose";

export default function RobotClass() {
  return (
    <PageTemplate
      title="Robot.java owns what survives every mode"
      emphasis="survives every mode"
      lede="The Robot object is created once and remains alive while teleop, autonomous, and utility OpModes come and go. It owns shared mechanisms, starts course-wide services, and advances the command scheduler every loop."
      needs={[
        <>
          The project from <strong>Project Setup</strong> open in VS Code.
        </>,
        <>
          The scheduler vocabulary from <strong>Command-Based Framework</strong>
          .
        </>,
        <>
          The mode boundary from <strong>OpModes</strong>.
        </>,
      ]}
      time="About 20 minutes"
    >
      <Split>
        <KeyConceptSection
          description={[
            "Robot is the composition root: the one place where long-lived pieces are constructed and made available to the rest of the program.",
            "Robot does not contain teleop bindings or an autonomous chooser. OpModes own mode-specific behavior and the framework discovers them.",
          ]}
          concept="Robot owns shared lifetime. OpModes own selected behavior. Mechanisms own hardware."
        />
        <MarginNote label="OLDER EXAMPLES">
          A tutorial that sends you to RobotContainer is teaching Commands v2.
          This Commands v3 project puts shared objects in Robot and bindings in
          OpModes.
        </MarginNote>
      </Split>

      <LessonSection
        id="read-the-file"
        title="Read Robot.java from top to bottom"
      >
        <CodeBlock
          language="java"
          filename="src/main/java/frc/robot/Robot.java"
          title="Robot.java — the complete shape"
          code={`package frc.robot;

import frc.robot.subsystems.Arm;
import frc.robot.subsystems.Flywheel;
import org.wpilib.command3.Scheduler;
import org.wpilib.framework.OpModeRobot;

public class Robot extends OpModeRobot {
  // One shared object for each physical mechanism.
  public final Arm arm = new Arm();
  public final Flywheel flywheel = new Flywheel();

  public Robot() {
    // Start course-wide services and add truly global bindings here.
  }

  @Override
  public void robotPeriodic() {
    Scheduler.getDefault().run();
  }
}`}
        />
        <p>
          The public fields let an OpMode receive <code>Robot robot</code> and
          ask for <code>robot.arm</code>. The fields are <code>final</code>
          because the same mechanism object must survive mode changes.
        </p>
      </LessonSection>

      <LessonSection
        id="scheduler"
        title="Run the scheduler exactly once per robot loop"
      >
        <p>
          <code>robotPeriodic()</code> is called by the framework on every robot
          tick. Passing that tick to <code>Scheduler.getDefault().run()</code>
          checks triggers, schedules queued commands, advances running commands,
          and starts default commands for idle mechanisms.
        </p>
        <Box
          variant="alert-warning"
          tag="LOAD-BEARING"
          title="Do not move or duplicate this line"
        >
          <p>
            If the scheduler runs only in teleop, autonomous commands never
            advance. If it runs twice, every command advances twice per robot
            loop. Keep one scheduler call in <code>Robot.robotPeriodic()</code>.
          </p>
        </Box>
      </LessonSection>

      <LessonSection
        id="constructor"
        title="Reserve the constructor for course-wide setup"
      >
        <p>
          Good occupants of the <code>Robot</code> constructor include:
        </p>
        <ul className="ml-5 list-disc space-y-2">
          <li>starting DataLogManager and DriverStation logging;</li>
          <li>constructing a service used by several mechanisms or modes;</li>
          <li>a safety or diagnostic binding that must exist in every mode;</li>
          <li>
            registering a background scheduler task that truly has robot-wide
            lifetime.
          </li>
        </ul>
        <p>These belong elsewhere:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>driver buttons — put them in the teleop OpMode;</li>
          <li>an autonomous routine — put it in an autonomous OpMode;</li>
          <li>
            motor IDs and controller configuration — put them in the mechanism;
          </li>
          <li>a temporary calibration control — put it in a utility OpMode.</li>
        </ul>
      </LessonSection>

      <LessonSection
        id="ownership-test"
        title="Use one ownership test for every new field"
      >
        <Box variant="concept" title="Ask what lifetime the object needs">
          <ul className="ml-5 list-disc space-y-2">
            <li>
              <strong>Physical hardware:</strong> mechanism field, with the
              mechanism itself owned by Robot.
            </li>
            <li>
              <strong>One operating mode:</strong> OpMode field.
            </li>
            <li>
              <strong>One command run:</strong> local variable or command field.
            </li>
            <li>
              <strong>The entire process:</strong> Robot field or a deliberately
              global service.
            </li>
          </ul>
        </Box>
        <p>
          This prevents two copies of the same motor object, buttons that remain
          active in the wrong mode, and services that disappear when an OpMode
          ends.
        </p>
      </LessonSection>
    </PageTemplate>
  );
}
