"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpenCheck, Check, ChevronDown, CircleHelp, Clock3, FlaskConical, LockKeyhole } from "lucide-react";
import { allLessons, modules } from "@/content/curriculum";

export default function CurriculumPage() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeLessonId, setActiveLessonId] = useState(allLessons[0].id);
  const [openModule, setOpenModule] = useState(modules[0].id);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const activeIndex = allLessons.findIndex((lesson) => lesson.id === activeLessonId);
  const lesson = allLessons[activeIndex] ?? allLessons[0];
  const activeModule = modules.find((module) => module.lessons.some((item) => item.id === lesson.id)) ?? modules[0];
  const previousLesson = allLessons[activeIndex - 1];
  const nextLesson = allLessons[activeIndex + 1];
  const completedCount = useMemo(() => completed.filter((id) => allLessons.some((item) => item.id === id)).length, [completed]);
  const progress = Math.round((completedCount / allLessons.length) * 100);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("qa-completed");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) setCompleted(parsed.filter((id): id is string => typeof id === "string"));
      }
    } catch {
      setCompleted([]);
    }
  }, []);

  useEffect(() => {
    const moduleId = window.location.hash.slice(1);
    const courseModule = modules.find((item) => item.id === moduleId);
    if (!courseModule) return;
    setOpenModule(courseModule.id);
    setActiveLessonId(courseModule.lessons[0].id);
  }, []);

  useEffect(() => {
    setSelectedAnswer(null);
    setCheckedAnswer(false);
  }, [activeLessonId]);

  function selectLesson(id: string, moduleId: string) {
    setActiveLessonId(id);
    setOpenModule(moduleId);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function toggleComplete() {
    const next = completed.includes(lesson.id) ? completed.filter((id) => id !== lesson.id) : [...completed, lesson.id];
    setCompleted(next);
    try { localStorage.setItem("qa-completed", JSON.stringify(next)); } catch { /* Progress remains available for this visit. */ }
  }

  const experimentHref = lesson.experiment.preset
    ? `/playground?preset=${encodeURIComponent(lesson.experiment.preset)}`
    : "/playground";
  const isCompleted = completed.includes(lesson.id);
  const answerCorrect = checkedAnswer && selectedAnswer === lesson.checkpoint.answer;

  return <div className="page-wrap inner-page course-page">
    <div className="breadcrumb"><Link href="/"><ArrowLeft size={14} aria-hidden="true" /> Overview</Link><span>/</span><span>Curriculum</span></div>
    <section className="page-intro course-intro">
      <div><div className="eyebrow"><span className="eyebrow-line" /> A COMPLETE LEARNING PATH</div><h1>From first qubit<br /><em>to real experiments.</em></h1><p>Ten connected modules move from intuition and linear algebra to algorithms, error correction, hardware, and experimental practice. Start anywhere; your progress stays in this browser.</p></div>
      <div className="progress-panel"><span className="panel-label">COURSE PROGRESS</span><strong>{progress}<small>%</small></strong><div className="progress-track" role="progressbar" aria-label="Course progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div><span className="progress-caption">{completedCount} of {allLessons.length} lessons complete</span></div>
    </section>

    <div className="course-layout">
      <aside className="syllabus" aria-label="Course modules">
        <div className="syllabus-head"><BookOpenCheck size={16} aria-hidden="true" /><span>COURSE MAP</span><span className="syllabus-total">{allLessons.length}</span></div>
        <div className="syllabus-note"><LockKeyhole size={14} aria-hidden="true" /><span>No account. Progress is stored on this device.</span></div>
        <nav className="module-nav" aria-label="Modules">
          {modules.map((module) => {
            const expanded = openModule === module.id;
            const moduleDone = module.lessons.filter((item) => completed.includes(item.id)).length;
            return <section className={expanded ? "syllabus-module syllabus-module-open" : "syllabus-module"} id={module.id} key={module.id}>
              <button className="module-anchor" type="button" aria-expanded={expanded} aria-controls={`lessons-${module.id}`} onClick={() => setOpenModule(expanded ? "" : module.id)}>
                <span className="module-number-small">{module.number}</span><span className="module-anchor-title">{module.title}</span><span className="module-count">{moduleDone}/{module.lessons.length}</span><ChevronDown size={13} aria-hidden="true" />
              </button>
              <div className="syllabus-lessons" id={`lessons-${module.id}`} hidden={!expanded}>
                {module.lessons.map((item, index) => <button className={item.id === lesson.id ? "syllabus-lesson syllabus-lesson-active" : "syllabus-lesson"} key={item.id} type="button" aria-pressed={item.id === lesson.id} onClick={() => selectLesson(item.id, module.id)}>
                  <span className={completed.includes(item.id) ? "lesson-check done" : "lesson-check"}>{completed.includes(item.id) ? <Check size={11} aria-hidden="true" /> : `${index + 1}`}</span><span>{item.title}</span>
                </button>)}
              </div>
            </section>;
          })}
        </nav>
        <div className="syllabus-footer">10 modules <span>·</span> {allLessons.length} lessons <span>·</span> beginner to advanced</div>
      </aside>

      <article className="lesson-reader" key={lesson.id}>
        <div className="lesson-context"><span>{activeModule.number} / {activeModule.title}</span><span><Clock3 size={13} aria-hidden="true" /> {lesson.duration}</span><span>{lesson.level}</span></div>
        <div className="lesson-heading"><span className="lesson-position">LESSON {String(activeIndex + 1).padStart(2, "0")} OF {String(allLessons.length).padStart(2, "0")}</span><h2>{lesson.title}</h2><p className="lesson-objective"><strong>By the end:</strong> {lesson.objective}</p></div>
        <div className="module-outcomes"><span className="panel-label">IN THIS MODULE</span><span>{activeModule.subtitle}</span><details><summary>Learning outcomes</summary><ul>{activeModule.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul></details></div>

        <div className="lesson-content">
          {lesson.sections.map((section) => <section className="lesson-section" key={section.heading}><h3>{section.heading}</h3>{section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{section.equation && <div className="equation-block"><span className="panel-label">IN NOTATION</span><code>{section.equation}</code></div>}{section.note && <p className="lesson-note">{section.note}</p>}</section>)}
        </div>

        <div className="lesson-practice-grid">
          <section className="worked-example"><div className="practice-heading"><span className="panel-label">WORKED EXAMPLE</span><CircleHelp size={15} aria-hidden="true" /></div><h3>{lesson.example.title}</h3><ol>{lesson.example.steps.map((step) => <li key={step}>{step}</li>)}</ol><p className="example-result"><strong>Result</strong>{lesson.example.result}</p></section>
          <section className="experiment-card"><div className="practice-heading"><span className="panel-label">HANDS-ON EXPERIMENT</span><FlaskConical size={15} aria-hidden="true" /></div><h3>{lesson.experiment.title}</h3><p>{lesson.experiment.description}</p><ol>{lesson.experiment.steps.map((step) => <li key={step}>{step}</li>)}</ol><Link className="text-link" href={experimentHref}>Open this circuit in the lab <ArrowUpRight size={15} aria-hidden="true" /></Link></section>
        </div>

        <section className="checkpoint" aria-labelledby="checkpoint-title">
          <div className="checkpoint-kicker"><span className="panel-label">CHECK YOUR UNDERSTANDING</span><span>Self-check · not graded</span></div>
          <h3 id="checkpoint-title">{lesson.checkpoint.question}</h3>
          <fieldset className="checkpoint-options"><legend className="sr-only">Choose one answer</legend>{lesson.checkpoint.options.map((option, index) => <label className={checkedAnswer && selectedAnswer === index ? (answerCorrect ? "answer-option answer-correct" : "answer-option answer-incorrect") : "answer-option"} key={option}><input type="radio" name={`answer-${lesson.id}`} checked={selectedAnswer === index} onChange={() => { setSelectedAnswer(index); setCheckedAnswer(false); }} /><span className="answer-marker">{String.fromCharCode(65 + index)}</span><span>{option}</span></label>)}</fieldset>
          <div className="checkpoint-response" aria-live="polite">{checkedAnswer && <p className={answerCorrect ? "feedback feedback-correct" : "feedback feedback-incorrect"}>{answerCorrect ? "Correct." : "Not quite."} {lesson.checkpoint.explanation}</p>}</div>
          <button className="button-secondary check-answer" type="button" disabled={selectedAnswer === null} onClick={() => setCheckedAnswer(true)}>{checkedAnswer ? "Check again" : "Check answer"} <ArrowRight size={14} aria-hidden="true" /></button>
        </section>

        {activeModule.references.length > 0 && <aside className="lesson-references"><span className="panel-label">FURTHER READING</span>{activeModule.references.map((reference) => <a href={reference.href} key={reference.href} target="_blank" rel="noreferrer">{reference.label} <ArrowUpRight size={13} aria-hidden="true" /></a>)}</aside>}

        <div className="lesson-footer-actions"><button type="button" className={isCompleted ? "button-secondary complete-button is-complete" : "button-primary complete-button"} onClick={toggleComplete}>{isCompleted ? <><Check size={15} aria-hidden="true" /> Completed</> : <>Mark lesson complete <Check size={15} aria-hidden="true" /></>}</button><div className="lesson-pager"><button type="button" className="button-quiet" disabled={!previousLesson} onClick={() => previousLesson && selectLesson(previousLesson.id, modules.find((item) => item.lessons.some((entry) => entry.id === previousLesson.id))!.id)}><ArrowLeft size={14} aria-hidden="true" /> Previous</button><button type="button" className="button-quiet" disabled={!nextLesson} onClick={() => nextLesson && selectLesson(nextLesson.id, modules.find((item) => item.lessons.some((entry) => entry.id === nextLesson.id))!.id)}>Next lesson <ArrowRight size={14} aria-hidden="true" /></button></div></div>
      </article>
    </div>
    <section className="course-next"><div><span className="panel-label">WHEN YOU ARE READY</span><h2>Take the model for a run.</h2><p>The lab simulates ideal circuits locally and shows both theoretical probabilities and sampled counts.</p></div><Link href="/playground" className="button-primary">Open the quantum lab <ArrowRight size={15} aria-hidden="true" /></Link></section>
  </div>;
}
