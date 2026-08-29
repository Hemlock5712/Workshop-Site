/**
 * The two bench mechanisms, and the handful of words that differ between them.
 *
 * Every lesson from `/building-subsystems` onward is written once and read
 * twice: a student picks Arm or Flywheel at the top of the page and reads a
 * lesson about that mechanism. The prose is not duplicated to do it. A
 * sentence that is the same for both is written once with a slot in it —
 * `<M k="file" />` — and the slot is filled from here.
 *
 * That is the whole point of this file. Two copies of "the constructor runs
 * one time, the moment the object is built" drift apart the first time
 * somebody edits one of them, and nothing catches it, because both readings
 * still make sense. One copy with a slot cannot drift.
 *
 * ## What belongs here
 *
 * Vocabulary: a name, a filename, a field, the CAN IDs, the verb this
 * mechanism takes. Words a sentence needs in order to be about one mechanism
 * rather than the other.
 *
 * ## What does not
 *
 * Sentences. If a paragraph is genuinely different for the arm and the
 * flywheel, such as the CANcoder in the arm's feedback loop, it is
 * different content, not a substitution, and it goes in the page inside
 * `<Mech for="arm">` / `<Mech for="flywheel">`. Adding a `sentence` key here
 * would turn this file into a second content store that nobody reviews as
 * prose, which is the failure mode it exists to prevent.
 *
 * Keep the slot list short. Eleven keys covering nine lessons is a sign the
 * split is in the right place; forty would mean the pages are being written
 * here instead of in the pages.
 */

export type MechanismId = "arm" | "flywheel";

/** The substitutable words. Every key here is one or two words, never a clause. */
export interface MechanismSlots {
  /** Java class name, and the label on the selector box. `Arm` */
  name: string;
  /** Lowercase noun for running prose: "the arm holds position". `arm` */
  noun: string;
  /** Source file. `Arm.java` */
  file: string;
  /** Full path from the project root, for a `filename` on a code block. */
  path: string;
  /** The field the code sends control requests to. `motor` */
  motor: string;
  /**
   * The CAN IDs this mechanism owns, as prose: `31 and 32` for the arm, `21`
   * for the flywheel. A sentence using this slot has to read correctly with
   * either one, so word it around the list rather than agreeing with it.
   */
  ids: string;
  /** What this mechanism does when you push it. `move` / `spin` */
  verb: string;
  /** What you do to it on the bench. `move the arm by hand` */
  byHand: string;
  /**
   * The *other* mechanism's class name: `Flywheel` when you are reading the
   * arm. `Robot` builds both and the teleop OpMode binds both, so a team
   * building one has to delete the other's field and bindings. That sentence
   * is the same for both readers apart from this word, so it is a slot rather
   * than two near-identical `<Mech>` blocks.
   */
  other: string;
  /** The other mechanism's lowercase field name. `flywheel` */
  otherNoun: string;
  /**
   * The private setter once the mechanism goes closed loop: `setPosition` on
   * the arm, `setVelocity` on the flywheel. Both replace `setVoltage`, and
   * `/motion-magic-code` has to name the right one or a student renames a
   * method the commands never call.
   */
  setter: string;
}

export type MechanismSlot = keyof MechanismSlots;

export interface MechanismProfile extends MechanismSlots {
  id: MechanismId;
  /**
   * The render on the selector box, cropped to a circle. The same 2048px
   * squares the home page's mechanism strip uses, so a student recognises the
   * thing on the bench from the picture they were shown on the way in.
   */
  image: string;
  /** Alt text for that render. */
  imageAlt: string;
}

export const MECHANISMS: Record<MechanismId, MechanismProfile> = {
  arm: {
    id: "arm",
    name: "Arm",
    noun: "arm",
    file: "Arm.java",
    path: "src/main/java/first/robot/mechanisms/Arm.java",
    motor: "motor",
    ids: "31 and 32",
    verb: "move",
    byHand: "move the arm by hand",
    other: "Flywheel",
    otherNoun: "flywheel",
    setter: "setPosition",
    image: "/images/mechanisms/arm.png",
    imageAlt: "The single-jointed arm on its bench mount",
  },
  flywheel: {
    id: "flywheel",
    name: "Flywheel",
    noun: "flywheel",
    file: "Flywheel.java",
    path: "src/main/java/first/robot/mechanisms/Flywheel.java",
    motor: "motor",
    ids: "21",
    verb: "spin",
    byHand: "spin the wheel by hand",
    other: "Arm",
    otherNoun: "arm",
    setter: "setVelocity",
    image: "/images/mechanisms/flywheel.png",
    imageAlt: "The shooter flywheel on its bench mount",
  },
};

export const MECHANISM_IDS: MechanismId[] = ["arm", "flywheel"];

/** The one a page shows when nobody has chosen, and when JavaScript never arrives. */
export const DEFAULT_MECHANISM: MechanismId = "arm";

/** localStorage key. Read before first paint by the inline script in the root layout. */
export const MECHANISM_STORAGE_KEY = "workshop:mechanism";
