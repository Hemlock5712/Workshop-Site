"use client";

import { useState } from "react";
import { quizWinConfetti } from "@/lib/utils";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizProps {
  title: string;
  questions: QuizQuestion[];
}

/**
 * "Check yourself" — the end-of-lesson knowledge check.
 *
 * Open by default. It used to be collapsed behind a disclosure, which meant
 * the one part of the page that tells a student whether they actually
 * understood it was the one part most of them never saw.
 *
 * Grading marks the right answer rather than scolding the wrong one: the
 * chosen-but-wrong option is dimmed and labelled "not this one", and the
 * explanation always appears. The point is to leave knowing why, not to
 * score.
 */
export default function Quiz({ title, questions }: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);

  const answered = Object.keys(answers).length === questions.length;
  const score = questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;

  const submit = () => {
    if (graded) {
      setGraded(false);
      setAnswers({});
      return;
    }
    if (!answered) return;
    setGraded(true);
    if (score === questions.length) quizWinConfetti();
  };

  return (
    <section
      id="check-yourself"
      data-sec="check-yourself"
      data-sec-label="Check yourself"
      className="measure-wide scroll-mt-24"
      aria-label={title}
    >
      <div className="mb-[26px] flex items-baseline gap-4">
        <span
          className="mono sec-num tabular shrink-0"
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--accent)",
          }}
          aria-hidden="true"
        />
        <h2
          className="display m-0"
          style={{
            fontSize: "clamp(27px, 3.4vw, 38px)",
            lineHeight: 1.08,
            letterSpacing: "-0.015em",
          }}
        >
          {title}
        </h2>
        <span
          aria-hidden="true"
          className="h-px flex-1"
          style={{ background: "var(--rule-soft)" }}
        />
      </div>

      <div
        className="px-5 py-7 sm:px-[34px] sm:py-8"
        style={{
          background: "var(--bg2)",
          border: "1px solid var(--rule)",
          borderRadius: 3,
        }}
      >
        {questions.map((q, qi) => (
          <div
            key={q.id}
            className="mb-[26px] pb-[26px]"
            style={{ borderBottom: "1px solid var(--rule-soft)" }}
          >
            <div className="mb-4 flex gap-3.5">
              <span
                className="mono tabular shrink-0 pt-2"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  color: "var(--accent)",
                }}
              >
                {String(qi + 1).padStart(2, "0")}
              </span>
              <p
                className="display m-0"
                style={{
                  fontSize: "clamp(20px, 2.4vw, 26px)",
                  lineHeight: 1.2,
                }}
              >
                {q.question}
              </p>
            </div>

            <div
              className="flex flex-col gap-px sm:pl-[34px]"
              role="radiogroup"
              aria-label={q.question}
            >
              {q.options.map((option, oi) => {
                const picked = answers[q.id] === oi;
                const right = oi === q.correctAnswer;

                let color = "var(--tx2)";
                let background = "transparent";
                let letterColor = "var(--tx3)";
                let flag = "";
                let flagColor = "var(--tx3)";

                if (graded && right) {
                  color = "var(--tx)";
                  background = "var(--accent-soft)";
                  letterColor = "var(--accent)";
                  flag = "correct";
                  flagColor = "var(--accent)";
                } else if (graded && picked) {
                  color = "var(--tx3)";
                  flag = "not this one";
                } else if (picked) {
                  color = "var(--tx)";
                  background = "var(--accent-soft)";
                  letterColor = "var(--accent)";
                }

                return (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={picked}
                    disabled={graded}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: oi }))
                    }
                    className="flex w-full items-baseline gap-3.5 border-0 px-3.5 py-[11px] text-left transition-colors enabled:cursor-pointer"
                    style={{ borderRadius: 2, background, color }}
                  >
                    <span
                      className="mono shrink-0"
                      style={{ fontSize: 11, color: letterColor }}
                    >
                      {String.fromCharCode(97 + oi)}.
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: 17,
                        lineHeight: 1.45,
                      }}
                    >
                      {option}
                    </span>
                    {flag && (
                      <span
                        className="mono ml-auto shrink-0 whitespace-nowrap"
                        style={{
                          fontSize: 9,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: flagColor,
                        }}
                      >
                        {flag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {graded && (
              <div className="mt-5 grid grid-cols-[56px_1fr] gap-5 sm:ml-[34px] sm:grid-cols-[80px_1fr]">
                <div
                  className="mono pt-[5px] text-right"
                  style={{
                    fontSize: 9.5,
                    letterSpacing: "0.13em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                  }}
                >
                  Why
                </div>
                <div
                  className="pl-5 sm:pl-[22px]"
                  style={{
                    borderLeft: "1px solid var(--rule)",
                    fontFamily: "var(--font-serif)",
                    fontSize: 16.5,
                    lineHeight: 1.62,
                    color: "var(--tx2)",
                  }}
                >
                  {q.explanation}
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-5 pt-2 sm:pl-[34px]">
          <button
            type="button"
            onClick={submit}
            disabled={!answered && !graded}
            className="whitespace-nowrap px-[22px] py-[11px] text-[13px] font-semibold transition-opacity enabled:cursor-pointer disabled:cursor-not-allowed"
            style={{
              borderRadius: 2,
              border: `1px solid ${answered || graded ? "var(--accent)" : "var(--rule)"}`,
              background: answered && !graded ? "var(--accent)" : "transparent",
              color:
                answered && !graded
                  ? "var(--accent-ink)"
                  : answered || graded
                    ? "var(--accent)"
                    : "var(--tx3)",
            }}
          >
            {graded ? "Reset" : "Check answers"}
          </button>
          <span
            aria-live="polite"
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 15.5,
              color: "var(--tx3)",
            }}
          >
            {graded
              ? `${score} of ${questions.length} right.`
              : answered
                ? ""
                : "Pick an answer for each."}
          </span>
        </div>
      </div>
    </section>
  );
}
