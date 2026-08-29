"use client";

import { useEffect, useId, useState } from "react";
import { quizWinConfetti } from "@/lib/utils";
import { DEFAULT_MECHANISM, type MechanismId } from "@/data/mechanisms";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  /**
   * Ask this only of the student reading that mechanism. Omitted means both,
   * which is the common case — fork a question only where the answer actually
   * depends on which mechanism is on the bench, such as cruise velocity, which
   * a flywheel's control mode ignores entirely.
   */
  only?: MechanismId;
}

interface QuizProps {
  /**
   * Heading. Defaults to "Check yourself", which is also the anchor id and the
   * outline label — every call site passed the same title, and 26 of them
   * passed one ("Knowledge Check") that contradicted the label the outline
   * rail was already showing. The default is now the single authored name.
   */
  title?: string;
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
 *
 * The options are native radios hidden behind their labels. They were styled
 * buttons carrying `role="radio"`, which announced a radio group and then
 * behaved like nothing of the sort: six questions meant twenty-four separate
 * tab stops and no arrow keys. The platform gives the right contract — one tab
 * stop per question, arrows to move within it — for free.
 */
export default function Quiz({
  title = "Check yourself",
  questions,
}: QuizProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [graded, setGraded] = useState(false);
  // Radios group by `name`, so the name has to be unique to this instance,
  // not just to the question.
  const uid = useId();

  /**
   * Which reading the student picked. Every other fork on the site is CSS
   * hiding one branch of the server HTML, and this one cannot be: scoring has
   * to know how many questions are really being asked. A `display: none`
   * question is still in `questions.length`, so the grade button would never
   * unlock and "4 of 6 right" would count two the reader never saw.
   *
   * Starts at the default so the first client render matches the server's, and
   * corrects in the effect. The observer is what makes the selector at the top
   * of the page work: picking the other mechanism rewrites the attribute on
   * `<html>` without a navigation, and the question set has to follow.
   */
  const [reading, setReading] = useState<MechanismId>(DEFAULT_MECHANISM);

  useEffect(() => {
    const root = document.documentElement;
    const read = () => {
      const m = root.dataset.mechanism;
      setReading(m === "arm" || m === "flywheel" ? m : DEFAULT_MECHANISM);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-mechanism"],
    });
    return () => observer.disconnect();
  }, []);

  const asked = questions.filter((q) => !q.only || q.only === reading);

  // Switching mechanism mid-quiz swaps some of the questions out. Keeping the
  // old answers would leave the reader graded on a set they cannot see.
  useEffect(() => {
    setAnswers({});
    setGraded(false);
  }, [reading]);

  const answered = asked.every((q) => answers[q.id] !== undefined);
  const score = asked.filter((q) => answers[q.id] === q.correctAnswer).length;

  const submit = () => {
    if (graded) {
      setGraded(false);
      setAnswers({});
      return;
    }
    if (!answered) return;
    setGraded(true);
    if (score === asked.length) quizWinConfetti();
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
          className="mono sec-num tabular shrink-0 text-micro"
          style={{
            letterSpacing: "0.14em",
            color: "var(--accent)",
          }}
          aria-hidden="true"
        />
        <h2 className="display-section m-0 min-w-0">{title}</h2>
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
        {asked.map((q, qi) => (
          <div
            key={q.id}
            className="mb-[26px] pb-[26px]"
            style={{ borderBottom: "1px solid var(--rule-soft)" }}
          >
            <div className="mb-4 flex min-w-0 gap-3.5">
              <span
                className="mono tabular shrink-0 pt-2"
                style={{
                  fontSize: "var(--text-micro)",
                  letterSpacing: "0.12em",
                  color: "var(--accent)",
                }}
              >
                {String(qi + 1).padStart(2, "0")}
              </span>
              <p
                className="display m-0 min-w-0"
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
                  <label
                    key={oi}
                    className="quiz-option flex w-full items-baseline gap-3.5 px-3.5 py-[11px] text-left transition-colors"
                    style={{
                      borderRadius: 2,
                      background,
                      color,
                      cursor: graded ? "default" : "pointer",
                    }}
                  >
                    {/* `aria-disabled` rather than `disabled`: grading is the
                        moment the explanation appears beside these, and the
                        real attribute would drop every option out of the tab
                        order exactly then. The handler declines instead. */}
                    <input
                      type="radio"
                      className="quiz-radio"
                      name={`${uid}-q${q.id}`}
                      value={oi}
                      checked={picked}
                      aria-disabled={graded || undefined}
                      onChange={() => {
                        if (graded) return;
                        setAnswers((prev) => ({ ...prev, [q.id]: oi }));
                      }}
                    />
                    <span
                      className="mono shrink-0"
                      style={{
                        fontSize: "var(--text-meta)",
                        color: letterColor,
                      }}
                    >
                      {String.fromCharCode(97 + oi)}.
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "var(--text-aside)",
                        lineHeight: 1.45,
                      }}
                    >
                      {option}
                    </span>
                    {flag && (
                      <span
                        className="mono ml-auto shrink-0 whitespace-nowrap"
                        style={{
                          fontSize: "var(--text-micro)",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: flagColor,
                        }}
                      >
                        {flag}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* The explanation is the whole point of the quiz, so it is
                announced when it lands. The region is always mounted and
                filled on grading — a live region added to the DOM at the same
                moment as its content is unreliably announced. */}
            <div
              role="status"
              className={
                graded
                  ? "mt-5 grid grid-cols-[56px_minmax(0,1fr)] gap-5 sm:ml-[34px] sm:grid-cols-[80px_minmax(0,1fr)]"
                  : undefined
              }
            >
              {graded && (
                <>
                  <div
                    className="mono pt-[5px] text-right"
                    style={{
                      fontSize: "var(--text-micro)",
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
                      fontSize: "var(--text-aside)",
                      lineHeight: 1.62,
                      color: "var(--tx2)",
                    }}
                  >
                    {q.explanation}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        <div className="flex flex-wrap items-center gap-5 pt-2 sm:pl-[34px]">
          <button
            type="button"
            onClick={submit}
            disabled={!answered && !graded}
            className="whitespace-nowrap px-[22px] py-[11px] text-note font-semibold transition-opacity enabled:cursor-pointer disabled:cursor-not-allowed"
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
              fontSize: "var(--text-ui)",
              color: "var(--tx3)",
            }}
          >
            {graded
              ? `${score} of ${asked.length} right.`
              : answered
                ? ""
                : "Pick an answer for each."}
          </span>
        </div>
      </div>
    </section>
  );
}
