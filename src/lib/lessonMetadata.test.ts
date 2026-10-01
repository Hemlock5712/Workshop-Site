import { describe, expect, it } from "vitest";
import { LESSONS } from "@/data/lessons";
import { lessonMetadata } from "./lessonMetadata";

describe("lessonMetadata", () => {
  it("titles every lesson after its lessons.ts entry", () => {
    for (const lesson of LESSONS) {
      const meta = lessonMetadata(lesson.slug);
      expect(meta.title).toBe(lesson.title);
      expect(meta.alternates?.canonical).toBe(lesson.slug);
    }
  });

  it("throws on a slug that is not a lesson", () => {
    expect(() => lessonMetadata("/privacy")).toThrow(/not in/);
  });
});
