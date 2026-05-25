"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
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
 * Knowledge-check quiz styled per the design's checkpoint pattern.
 * Module wrapper with "CHECKPOINT · N / TOTAL" tag corner, mono A/B/C/D
 * answer chips, amber "EXPLAIN ↳" strip for explanations, and a single
 * Submit / Reset action row. Confetti fires on a perfect score.
 */
export default function Quiz({ title, questions }: QuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length !== questions.length) return;
    setSubmitted(true);
    setShowResults(true);
    if (getScore().percentage === 100) quizWinConfetti();
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults(false);
    setSubmitted(false);
  };

  const getScore = () => {
    const correct = questions.filter(
      (q) => selectedAnswers[q.id] === q.correctAnswer
    ).length;
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const score = getScore();
  const canSubmit =
    Object.keys(selectedAnswers).length === questions.length && !submitted;

  const summaryTone =
    score.percentage >= 80 ? "ok" : score.percentage >= 60 ? "warn" : "err";
  const summaryStripe = {
    ok: "var(--ok)",
    warn: "var(--accent)",
    err: "var(--err)",
  }[summaryTone];

  return (
    <div className="module relative overflow-hidden" style={{ paddingTop: 40 }}>
      <span className="module-tag">CHECKPOINT · {questions.length} ITEMS</span>

      {/* Collapse header (page-default closed; click to open) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-5 pb-3 pt-1 text-left transition-colors hover:bg-[var(--bg-elev-2)]"
      >
        <h3
          className="text-lg font-semibold"
          style={{ color: "var(--fg)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h3>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "var(--fg-mute)" }}
          aria-hidden
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5">
          {/* Results summary (only after submit) */}
          {showResults && (
            <div
              className="mb-5 rounded-md p-3.5"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--line)",
                borderLeft: `3px solid ${summaryStripe}`,
              }}
            >
              <div className="flex items-baseline gap-3">
                <span
                  className="mono"
                  style={{
                    fontSize: 10.5,
                    letterSpacing: "0.08em",
                    color: summaryStripe,
                  }}
                >
                  ↳ RESULTS
                </span>
                <span
                  className="mono tabular text-base font-semibold"
                  style={{ color: "var(--fg)" }}
                >
                  {String(score.correct).padStart(2, "0")}/
                  {String(score.total).padStart(2, "0")} · {score.percentage}%
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mono ml-auto inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] transition-colors"
                  style={{
                    border: "1px solid var(--line)",
                    background: "var(--bg-elev)",
                    color: "var(--fg-mute)",
                    letterSpacing: "0.05em",
                  }}
                >
                  <RotateCcw className="h-3 w-3" />
                  RESET
                </button>
              </div>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--fg-mute)" }}
              >
                {score.percentage >= 80
                  ? "Strong understanding. Move on with confidence."
                  : score.percentage >= 60
                    ? "Decent baseline — review the explanations below."
                    : "Re-read this lesson before continuing."}
              </p>
            </div>
          )}

          {/* Questions */}
          <div className="flex flex-col gap-6">
            {questions.map((question, qIdx) => {
              const selectedAnswer = selectedAnswers[question.id];
              const isCorrect = selectedAnswer === question.correctAnswer;

              return (
                <div key={question.id} className="flex flex-col gap-3">
                  <h4
                    className="text-[15px] font-semibold leading-snug"
                    style={{ color: "var(--fg)" }}
                  >
                    <span
                      className="mono"
                      style={{
                        color: "var(--fg-dim)",
                        marginRight: 8,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {String(qIdx + 1).padStart(2, "0")}
                    </span>
                    {question.question}
                  </h4>

                  <div className="flex flex-col gap-2">
                    {question.options.map((option, oIdx) => {
                      const isSelected = selectedAnswer === oIdx;
                      const isCorrectOpt = oIdx === question.correctAnswer;

                      let bg = "var(--bg)";
                      let border = "var(--line)";
                      let chipBorder = "var(--line)";
                      let chipColor = "var(--fg-dim)";

                      if (submitted) {
                        if (isCorrectOpt) {
                          bg = "oklch(0.78 0.14 155 / 0.10)";
                          border = "var(--ok)";
                          chipBorder = "var(--ok)";
                          chipColor = "var(--ok)";
                        } else if (isSelected) {
                          bg = "oklch(0.7 0.18 25 / 0.10)";
                          border = "var(--err)";
                          chipBorder = "var(--err)";
                          chipColor = "var(--err)";
                        }
                      } else if (isSelected) {
                        bg = "var(--primary-soft)";
                        border = "var(--primary-lifted)";
                        chipBorder = "var(--primary-lifted)";
                        chipColor = "var(--primary-lifted)";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          disabled={submitted}
                          onClick={() => handleAnswerSelect(question.id, oIdx)}
                          className="flex w-full items-center gap-3 rounded-sm p-3 text-left transition-all"
                          style={{
                            background: bg,
                            border: `1px solid ${border}`,
                            cursor: submitted ? "default" : "pointer",
                            color: "var(--fg)",
                          }}
                        >
                          <span
                            className="mono inline-flex shrink-0 items-center justify-center"
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 3,
                              border: `1px solid ${chipBorder}`,
                              fontSize: 11,
                              color: chipColor,
                            }}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-1 text-[14px]">{option}</span>
                          {submitted && isCorrectOpt && (
                            <span
                              className="mono"
                              style={{ fontSize: 10.5, color: "var(--ok)" }}
                            >
                              ✓ CORRECT
                            </span>
                          )}
                          {submitted && isSelected && !isCorrectOpt && (
                            <span
                              className="mono"
                              style={{ fontSize: 10.5, color: "var(--err)" }}
                            >
                              ✗ NOT QUITE
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div
                      className="rounded-md p-3.5"
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--line)",
                        borderLeft: "3px solid var(--accent)",
                      }}
                    >
                      <span
                        className="mono"
                        style={{
                          color: "var(--accent)",
                          fontSize: 10.5,
                          letterSpacing: "0.08em",
                        }}
                      >
                        EXPLAIN ↳
                      </span>{" "}
                      <span
                        className="text-[13.5px] leading-relaxed"
                        style={{ color: "var(--fg-mute)" }}
                      >
                        {question.explanation}
                      </span>
                      {!isCorrect && submitted && (
                        <div
                          className="mono mt-2"
                          style={{ fontSize: 10.5, color: "var(--fg-dim)" }}
                        >
                          You picked{" "}
                          <span style={{ color: "var(--err)" }}>
                            {selectedAnswer !== undefined
                              ? String.fromCharCode(65 + selectedAnswer)
                              : "—"}
                          </span>{" "}
                          · correct was{" "}
                          <span style={{ color: "var(--ok)" }}>
                            {String.fromCharCode(65 + question.correctAnswer)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit row */}
          {!submitted && (
            <div className="mt-7 flex items-center justify-between">
              <span
                className="mono"
                style={{
                  fontSize: 10.5,
                  color: "var(--fg-dim)",
                  letterSpacing: "0.06em",
                }}
              >
                {String(Object.keys(selectedAnswers).length).padStart(2, "0")}/
                {String(questions.length).padStart(2, "0")} answered
              </span>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-md px-5 py-2 text-[13px] font-semibold transition"
                style={{
                  background: canSubmit ? "var(--accent)" : "var(--bg-elev-2)",
                  color: canSubmit ? "var(--accent-fg)" : "var(--fg-dim)",
                  border: `1px solid ${canSubmit ? "var(--accent)" : "var(--line)"}`,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                }}
              >
                Submit checkpoint
                <span aria-hidden>→</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
