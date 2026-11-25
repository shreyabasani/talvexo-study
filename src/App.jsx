import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Clock,
  Award,
  CheckCircle2,
  Download,
  Eye,
  LogOut,
  ShieldCheck,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { soundEngine } from './sound';
import {
  SECTION_TIMERS,
  CHARACTERS,
  QUESTION_BANK,
  SURVEY_ITEMS,
  getBadgeTier,
} from './questionsData';

const STORAGE_KEY = 'talvexo_assessment_progress_v1';
const ADMIN_PASSWORD = 'Admin@2025';

function formatTime(secs) {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function CharacterAvatar({ char, size = 'md' }) {
  const dim = size === 'sm' ? 'w-12 h-12 text-base' : 'w-16 h-16 text-xl';
  return (
    <div
      className={`${dim} rounded-2xl flex items-center justify-center font-bold text-white shadow-md shrink-0 select-none`}
      style={{
        background: `linear-gradient(135deg, ${char.color}, #1E293B)`,
      }}
    >
      {char.initials}
    </div>
  );
}

function TimerPill({ seconds }) {
  let border = '#4A90E2';
  let text = '#2C2C2C';
  if (seconds <= 30) {
    border = '#E74C3C';
    text = '#E74C3C';
  } else if (seconds <= 120) {
    border = '#F5A623';
    text = '#B45309';
  }
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white font-semibold text-sm shadow-sm border-2 transition-colors"
      style={{ borderColor: border, color: text }}
    >
      <Clock className="w-4 h-4" />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}

function DashboardView({ dashboard, isGamified }) {
  const maxBar = Math.max(...dashboard.bars.map((b) => b.value), 1);

  return (
    <div
      className={
        isGamified
          ? 'bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6'
          : 'border border-slate-300 p-4 mb-6 bg-white'
      }
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {dashboard.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={
              isGamified
                ? 'bg-slate-50 border border-slate-200 rounded-lg p-3.5'
                : 'border border-slate-300 p-3 bg-white'
            }
          >
            <div className="text-xs text-slate-500 font-medium">{kpi.label}</div>
            <div
              className={`text-xl font-bold mt-1 ${
                isGamified ? 'text-[#0D9488]' : 'text-[#2C2C2C]'
              }`}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Bar Chart */}
        <div
          className={
            isGamified
              ? 'bg-slate-50 border border-slate-200 rounded-lg p-4'
              : 'border border-slate-300 p-3'
          }
        >
          <div className="text-sm font-semibold mb-3 text-[#2C2C2C]">
            {dashboard.barTitle}
          </div>
          <div className="space-y-2.5">
            {dashboard.bars.map((item) => {
              const widthPct = Math.round((item.value / maxBar) * 100);
              return (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-16 font-medium text-slate-700 shrink-0">
                    {item.name}
                  </span>
                  <div className="flex-1 bg-slate-200 h-5 rounded overflow-hidden">
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${widthPct}%`,
                        backgroundColor: isGamified ? '#4A90E2' : '#475569',
                      }}
                    />
                  </div>
                  <span className="w-14 text-right font-semibold text-slate-800">
                    ₹{item.value}L
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Segments or P&L Table */}
        <div
          className={
            isGamified
              ? 'bg-slate-50 border border-slate-200 rounded-lg p-4'
              : 'border border-slate-300 p-3'
          }
        >
          {dashboard.type === 'marketing' ? (
            <>
              <div className="text-sm font-semibold mb-3 text-[#2C2C2C]">
                {dashboard.segmentsTitle}
              </div>
              <div className="space-y-2.5">
                {dashboard.segments.map((seg) => (
                  <div key={seg.name} className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5">
                    <span className="font-medium text-slate-700">{seg.name}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        isGamified
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {seg.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-semibold mb-2 text-[#2C2C2C]">
                {dashboard.pnlTitle}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500">
                      <th className="py-1">Metric</th>
                      <th className="py-1">Q3</th>
                      <th className="py-1">Q4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.pnlRows.map((row) => (
                      <tr key={row.metric} className="border-b border-slate-200">
                        <td className="py-1.5 font-medium text-slate-700">
                          {row.metric}
                        </td>
                        <td className="py-1.5 text-slate-600">{row.q3}</td>
                        <td className="py-1.5 font-semibold text-slate-800">
                          {row.q4}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isAdminRoute =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <AdminPanel />;
  }

  return <CandidateAssessment />;
}

function CandidateAssessment() {
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const isPreview = params.get('preview') === 'true';

  const [step, setStep] = useState(isPreview ? 'welcome' : 'landing');
  const [consentChecked, setConsentChecked] = useState(false);
  const [muted, setMuted] = useState(false);

  // Registration & Assignment State
  const [form, setForm] = useState({
    full_name: isPreview ? 'Preview Candidate' : '',
    college_name: isPreview ? 'VIT Business School' : '',
    email: isPreview ? 'preview@talvexo.edu' : '',
    gender: '',
    age: '',
    gaming_frequency: '',
    gaming_type: '',
    prior_gamified_experience: '',
    stream: params.get('stream') === 'finance' ? 'Finance' : 'Marketing',
  });
  const [formError, setFormError] = useState('');
  const [resumeOffer, setResumeOffer] = useState(null);

  const [mode, setMode] = useState(
    params.get('mode') === 'traditional' ? 'Traditional' : 'Gamified'
  );
  const [randomDecimal, setRandomDecimal] = useState(0.25);

  // Section & Question State
  const [section, setSection] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECTION_TIMERS[1]);
  const [answers, setAnswers] = useState({ 1: {}, 2: {}, 3: {} });
  const [sectionTimes, setSectionTimes] = useState({ 1: 0, 2: 0, 3: 0 });
  const [tradSelected, setTradSelected] = useState('');

  // Gamified Pop-up & Badge Transition State
  const [popup, setPopup] = useState(null);
  const [badgeTransitionSec, setBadgeTransitionSec] = useState(null);

  // 10-Second Reflection Buffer
  const [bufferLeft, setBufferLeft] = useState(10);

  // Survey State
  const [mcScore, setMcScore] = useState(0);
  const [survey, setSurvey] = useState({});
  const [openFeedback, setOpenFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const warnedRef = useRef(false);

  const roleTitle =
    form.stream === 'Finance' ? 'Financial Analyst' : 'Sales Executive';
  const isGamified = mode === 'Gamified';
  const bank = QUESTION_BANK[form.stream] || QUESTION_BANK.Marketing;
  const currentQuestions =
    section === 1
      ? bank.section1
      : section === 2
      ? bank.section2
      : bank.section3;

  // Check local saved progress on load
  useEffect(() => {
    if (isPreview) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.form && parsed.step === 'assessment') {
          setResumeOffer(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, [isPreview]);

  // Auto-save progress locally every 10 seconds during assessment
  useEffect(() => {
    if (isPreview || step !== 'assessment') return;
    const interval = setInterval(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            form,
            mode,
            randomDecimal,
            section,
            qIndex,
            timeLeft,
            answers,
            sectionTimes,
            step: 'assessment',
            savedAt: Date.now(),
          })
        );
      } catch {
        // Ignore storage errors
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [
    isPreview,
    step,
    form,
    mode,
    randomDecimal,
    section,
    qIndex,
    timeLeft,
    answers,
    sectionTimes,
  ]);

  // Section Countdown Timer
  useEffect(() => {
    if (step !== 'assessment' || popup) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 31 && isGamified && !warnedRef.current) {
          warnedRef.current = true;
          soundEngine.playWarning();
        }
        if (prev <= 1) {
          clearInterval(timer);
          handleSectionComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, section, popup, isGamified]);

  // 10-Second Reflection Buffer Timer
  useEffect(() => {
    if (step !== 'buffer') return;
    setBufferLeft(10);
    const interval = setInterval(() => {
      setBufferLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
  }

  function handleResumeSaved() {
    if (!resumeOffer) return;
    setForm(resumeOffer.form);
    setMode(resumeOffer.mode);
    setRandomDecimal(resumeOffer.randomDecimal);
    setSection(resumeOffer.section);
    setQIndex(resumeOffer.qIndex);
    setTimeLeft(resumeOffer.timeLeft);
    setAnswers(resumeOffer.answers);
    setSectionTimes(resumeOffer.sectionTimes || { 1: 0, 2: 0, 3: 0 });
    setResumeOffer(null);
    setStep('assessment');
  }

  function handleDiscardSaved() {
    localStorage.removeItem(STORAGE_KEY);
    setResumeOffer(null);
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();
    setFormError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.full_name.trim() || !form.college_name.trim()) {
      setFormError('Please enter your full name and college name.');
      return;
    }
    if (!emailRegex.test(form.email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (
      !form.gender ||
      !form.age ||
      !form.gaming_frequency ||
      !form.gaming_type ||
      !form.prior_gamified_experience ||
      !form.stream
    ) {
      setFormError('Please complete all fields before starting.');
      return;
    }

    const cleanForm = {
      ...form,
      email: form.email.trim().toLowerCase(),
      age: Number(form.age),
    };
    setForm(cleanForm);

    const rand = Number(Math.random().toFixed(4));
    const assigned = rand < 0.5 ? 'Gamified' : 'Traditional';
    setRandomDecimal(rand);
    setMode(assigned);

    setSection(1);
    setQIndex(0);
    setTimeLeft(SECTION_TIMERS[1]);
    setAnswers({ 1: {}, 2: {}, 3: {} });
    setTradSelected('');

    if (assigned === 'Gamified') {
      soundEngine.playClick();
      setStep('welcome');
    } else {
      setStep('assessment');
    }
  }

  function handleSectionComplete(timedOut = false) {
    const spent = SECTION_TIMERS[section] - (timedOut ? 0 : timeLeft);
    setSectionTimes((prev) => ({ ...prev, [section]: spent }));
    setPopup(null);
    setTradSelected('');
    warnedRef.current = false;

    if (isGamified) {
      soundEngine.playBadge();
      setBadgeTransitionSec(section);
      setStep('badge_transition');
      setTimeout(() => {
        setBadgeTransitionSec(null);
        advanceAfterSection(section);
      }, 3500);
    } else {
      advanceAfterSection(section);
    }
  }

  function advanceAfterSection(completedSec) {
    if (completedSec < 3) {
      const nextSec = completedSec + 1;
      setSection(nextSec);
      setQIndex(0);
      setTimeLeft(SECTION_TIMERS[nextSec]);
      setStep('assessment');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setStep('buffer');
    }
  }

  function handleGamifiedAnswer(opt) {
    if (popup) return;
    const q = currentQuestions[qIndex];
    const updated = {
      ...answers,
      [section]: {
        ...answers[section],
        [q.id]: { selected: opt.id, marks: opt.marks },
      },
    };
    setAnswers(updated);

    const speaker =
      section === 3
        ? CHARACTERS.ananya
        : form.stream === 'Finance'
        ? CHARACTERS.rohanFinance
        : CHARACTERS.rohanMarketing;

    let message = '';
    if (opt.marks === 4 || (section < 3 && opt.marks === 2)) {
      soundEngine.playSuccess();
      message = 'Spot on! Solid business reasoning.';
    } else if (section === 3 && opt.marks === 2) {
      soundEngine.playNeutral();
      message =
        'A cautious call—compliant, though there may be a stronger commercial balance.';
    } else {
      soundEngine.playNeutral();
      message =
        'Oops, not quite! Think carefully about the numbers and company policy—better luck on the next one!';
    }

    setPopup({ speaker, message });

    setTimeout(() => {
      setPopup(null);
      if (qIndex + 1 < currentQuestions.length) {
        setQIndex(qIndex + 1);
      } else {
        handleSectionComplete(false);
      }
    }, 1700);
  }

  function handleTraditionalNext() {
    if (!tradSelected) return;
    const q = currentQuestions[qIndex];
    const opt = q.options.find((o) => o.id === tradSelected);
    const updated = {
      ...answers,
      [section]: {
        ...answers[section],
        [q.id]: { selected: opt.id, marks: opt.marks },
      },
    };
    setAnswers(updated);
    setTradSelected('');

    if (qIndex + 1 < currentQuestions.length) {
      setQIndex(qIndex + 1);
    } else {
      handleSectionComplete(false);
    }
  }

  function computeScores() {
    const s1 = Object.values(answers[1] || {}).reduce(
      (sum, a) => sum + (a.marks || 0),
      0
    );
    const s2 = Object.values(answers[2] || {}).reduce(
      (sum, a) => sum + (a.marks || 0),
      0
    );
    const s3 = Object.values(answers[3] || {}).reduce(
      (sum, a) => sum + (a.marks || 0),
      0
    );
    return { s1, s2, s3, total: s1 + s2 + s3 };
  }

  const allSurveyAnswered = SURVEY_ITEMS.every((item) => survey[item.id] > 0);

  async function handleSurveySubmit(e) {
    e.preventDefault();
    if (!allSurveyAnswered || submitting) return;
    setSubmitting(true);
    setSubmitError('');

    const { s1, s2, s3, total } = computeScores();
    const badgeInfo = getBadgeTier(total);

    const engAvg = Number(
      ((survey.q1 + survey.q2 + survey.q3) / 3).toFixed(2)
    );
    const fairAvg = Number(
      ((survey.q4 + survey.q5 + survey.q6) / 3).toFixed(2)
    );
    const attrAvg = Number(
      ((survey.q7 + survey.q8 + survey.q9) / 3).toFixed(2)
    );

    const isMobile =
      typeof navigator !== 'undefined' &&
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    const payload = {
      full_name: form.full_name,
      college_name: form.college_name,
      email: form.email,
      gender: form.gender,
      age: Number(form.age),
      gaming_frequency: form.gaming_frequency,
      gaming_type: form.gaming_type,
      prior_gamified_experience: form.prior_gamified_experience,
      stream: form.stream,
      role_title: roleTitle,
      mode_assigned: mode,
      random_decimal: randomDecimal,
      device_type: isMobile ? 'Mobile' : 'Desktop',
      section1_score: s1,
      section2_score: s2,
      section3_score: s3,
      total_score: total,
      section1_time_seconds: sectionTimes[1] || 0,
      section2_time_seconds: sectionTimes[2] || 0,
      section3_time_seconds: sectionTimes[3] || 0,
      section1_answers: answers[1],
      section2_answers: answers[2],
      section3_answers: answers[3],
      manipulation_check: mcScore || null,
      q1: survey.q1,
      q2: survey.q2,
      q3: survey.q3,
      q4: survey.q4,
      q5: survey.q5,
      q6: survey.q6,
      q7: survey.q7,
      q8: survey.q8,
      q9: survey.q9,
      m1: survey.m1,
      m2: survey.m2,
      m3: survey.m3,
      open_feedback: openFeedback.trim() || null,
      engagement_avg: engAvg,
      fairness_avg: fairAvg,
      attractiveness_avg: attrAvg,
      performance_badge_tier: badgeInfo.tier,
    };

    if (!isPreview && supabase) {
      const { error } = await supabase.from('responses').insert([payload]);
      if (error) {
        setSubmitError(
          'Could not save to database. Please check your connection and try submitting again.'
        );
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    if (isGamified) {
      soundEngine.playBadge();
      setStep('results');
    } else {
      setStep('debrief');
    }
  }

  // ---------------- RENDER SCREENS ----------------

  return (
    <div
      className={`min-h-screen font-sans ${
        isGamified && step !== 'landing' && step !== 'consent' && step !== 'register'
          ? 'bg-[#F1F5F9]'
          : 'bg-white'
      } text-[#2C2C2C]`}
    >
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="bg-amber-500 text-white text-xs font-semibold px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <span>Preview Mode Active — No data will be written to Supabase.</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode(mode === 'Gamified' ? 'Traditional' : 'Gamified')}
              className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded"
            >
              Mode: {mode}
            </button>
            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  stream: f.stream === 'Marketing' ? 'Finance' : 'Marketing',
                }))
              }
              className="bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded"
            >
              Stream: {form.stream}
            </button>
            <a
              href="/admin"
              className="bg-slate-900 text-white px-2.5 py-1 rounded"
            >
              Exit Preview
            </a>
          </div>
        </div>
      )}

      {/* Top Navigation Bar during Assessment */}
      {(step === 'welcome' ||
        step === 'assessment' ||
        step === 'badge_transition') && (
        <header
          className={`sticky top-0 z-30 px-4 py-3 border-b ${
            isGamified
              ? 'bg-white/95 backdrop-blur border-slate-200 shadow-xs'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500 font-medium">
                {form.full_name}
              </div>
              <div className="text-sm font-bold text-[#2C2C2C]">
                Role: {roleTitle}
              </div>
            </div>

            {step === 'assessment' && (
              <div className="flex items-center gap-3">
                {isGamified && (
                  <button
                    onClick={toggleMute}
                    title={muted ? 'Unmute sound' : 'Mute sound'}
                    className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                <TimerPill seconds={timeLeft} />
              </div>
            )}
          </div>

          {step === 'assessment' && (
            <div className="max-w-4xl mx-auto mt-2.5">
              {isGamified ? (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4A90E2] transition-all duration-300"
                      style={{ width: `${(section / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Challenge {section} of 3
                  </span>
                </div>
              ) : (
                <div className="text-xs font-medium text-slate-600">
                  Section {section} of 3
                </div>
              )}
            </div>
          )}
        </header>
      )}

      {/* Top Character Pop-up Reaction (Gamified Mode Only) */}
      {isGamified && popup && (
        <div className="fixed top-20 left-1/2 z-50 w-[92%] max-w-md animate-pop-in">
          <div className="bg-white border-2 border-[#0D9488] rounded-2xl p-4 shadow-xl flex items-center gap-3.5">
            <CharacterAvatar char={popup.speaker} size="sm" />
            <div>
              <div className="text-xs font-bold text-[#0D9488]">
                {popup.speaker.name} • {popup.speaker.role}
              </div>
              <div className="text-sm font-medium text-[#2C2C2C] mt-0.5">
                {popup.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. LANDING PAGE */}
      {step === 'landing' && (
        <main className="max-w-xl mx-auto px-5 py-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#4A90E2] text-white font-bold text-2xl mb-4 shadow-sm">
            T
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Talvexo Campus Recruitment Assessment
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-4">
            Welcome to the Talvexo Campus Recruitment Assessment. This
            assessment is designed for MBA students applying for roles in
            Marketing and Finance. It evaluates your aptitude, domain
            knowledge, and situational judgment. Please complete all sections
            honestly and to the best of your ability.
          </p>

          <button
            onClick={() => setStep('consent')}
            className="mt-8 w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#4A90E2] hover:bg-blue-600 text-white font-semibold text-base shadow-sm transition"
          >
            Begin Assessment
          </button>

          <p className="text-xs text-slate-500 mt-5">
            This assessment takes approximately 25 minutes to complete. Ensure
            you are in a quiet place with a stable internet connection before
            starting.
          </p>
        </main>
      )}

      {/* 2. CONSENT SCREEN */}
      {step === 'consent' && (
        <main className="max-w-xl mx-auto px-5 py-14">
          <div className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white shadow-xs">
            <h2 className="text-xl font-bold mb-3">Research Consent</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This assessment is part of an academic research study on campus
              recruitment methods. Your responses will be used solely for
              research purposes and will remain completely confidential and
              anonymous. By proceeding you consent to your responses being used
              for academic research. Your email address is collected solely to
              enable assessment resume functionality and will not be used for
              any communication or shared with any third party.
            </p>

            <label className="flex items-start gap-3 mt-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#4A90E2]"
              />
              <span className="text-sm font-medium text-[#2C2C2C]">
                I consent to my responses being used for academic research
                purposes.
              </span>
            </label>

            <button
              disabled={!consentChecked}
              onClick={() => setStep('register')}
              className="mt-6 w-full py-3 rounded-lg bg-[#4A90E2] text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition"
            >
              Begin Registration
            </button>
          </div>
        </main>
      )}

      {/* 3. REGISTRATION SCREEN */}
      {step === 'register' && (
        <main className="max-w-xl mx-auto px-5 py-10">
          {resumeOffer && (
            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
              <div className="text-sm font-semibold text-blue-900">
                Welcome back! You have an incomplete assessment saved in this
                browser.
              </div>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={handleResumeSaved}
                  className="px-4 py-2 rounded-lg bg-[#4A90E2] text-white text-xs font-semibold"
                >
                  Continue Where I Left Off
                </button>
                <button
                  onClick={handleDiscardSaved}
                  className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-semibold"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleRegisterSubmit}
            className="border border-slate-200 rounded-xl p-6 sm:p-8 bg-white shadow-xs space-y-4"
          >
            <h2 className="text-xl font-bold">Candidate Registration</h2>

            {formError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                College Name *
              </label>
              <input
                type="text"
                value={form.college_name}
                onChange={(e) =>
                  setForm({ ...form, college_name: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="Enter your B-school / college name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                placeholder="you@college.edu"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Gender *
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Age *</label>
                <input
                  type="number"
                  min="18"
                  max="60"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. 23"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                How often do you play games on your phone, computer, or any
                device? *
              </label>
              <select
                value={form.gaming_frequency}
                onChange={(e) =>
                  setForm({ ...form, gaming_frequency: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Select</option>
                <option value="Never">Never</option>
                <option value="Less than once a week">
                  Less than once a week
                </option>
                <option value="1 to 3 times a week">1 to 3 times a week</option>
                <option value="4 or more times a week">
                  4 or more times a week
                </option>
                <option value="Every day">Every day</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                What type of games do you mainly play? *
              </label>
              <select
                value={form.gaming_type}
                onChange={(e) =>
                  setForm({ ...form, gaming_type: e.target.value })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Select</option>
                <option value="I do not play games">I do not play games</option>
                <option value="Mobile casual games such as Candy Crush or Ludo">
                  Mobile casual games such as Candy Crush or Ludo
                </option>
                <option value="Mobile strategy or action games such as PUBG or BGMI">
                  Mobile strategy or action games such as PUBG or BGMI
                </option>
                <option value="PC or console games">PC or console games</option>
                <option value="Multiple types equally">
                  Multiple types equally
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Have you previously encountered a gamified assessment? *
              </label>
              <select
                value={form.prior_gamified_experience}
                onChange={(e) =>
                  setForm({
                    ...form,
                    prior_gamified_experience: e.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                MBA Specialization Stream *
              </label>
              <select
                value={form.stream}
                onChange={(e) => setForm({ ...form, stream: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            {/* Locked Role Display for Both Modes */}
            {form.stream && (
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">
                  Assigned Assessment Role:
                </span>
                <span className="text-sm font-bold text-[#4A90E2]">
                  Your role: {roleTitle}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#4A90E2] hover:bg-blue-600 text-white font-semibold text-sm transition"
            >
              Submit Registration & Start
            </button>
          </form>
        </main>
      )}

      {/* 4. GAMIFIED WELCOME SCREEN (Priya Sharma) */}
      {step === 'welcome' && isGamified && (
        <main className="max-w-2xl mx-auto px-5 py-12">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CharacterAvatar char={CHARACTERS.priya} />
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-[#0D9488]">
                  {CHARACTERS.priya.name} • {CHARACTERS.priya.role}
                </div>
                <h2 className="text-xl font-bold mt-0.5">
                  Welcome to Your {roleTitle} Simulation
                </h2>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-teal-50/70 border border-teal-100 text-sm text-[#2C2C2C] leading-relaxed">
              “
              {form.stream === 'Finance'
                ? CHARACTERS.priya.welcomeFinance
                : CHARACTERS.priya.welcomeMarketing}
              ”
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-[#4A90E2]">Challenge 1 (8m)</div>
                <div className="text-slate-600 mt-0.5">
                  {bank.sectionTitles[1]}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-[#0D9488]">Challenge 2 (8m)</div>
                <div className="text-slate-600 mt-0.5">
                  {bank.sectionTitles[2]}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-[#F59E0B]">Challenge 3 (6m)</div>
                <div className="text-slate-600 mt-0.5">
                  {bank.sectionTitles[3]}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setStep('assessment');
              }}
              className="mt-6 w-full py-3.5 rounded-xl bg-[#4A90E2] hover:bg-blue-600 text-white font-semibold text-sm shadow-sm transition"
            >
              Start Challenge 1
            </button>
          </div>
        </main>
      )}

      {/* 5. ACTIVE ASSESSMENT SCREEN (BOTH MODES) */}
      {step === 'assessment' && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Section Character Intro Card (Gamified Mode Only, on first question of section) */}
          {isGamified && qIndex === 0 && (
            <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-xs flex items-center gap-3.5">
              <CharacterAvatar
                char={
                  section === 3
                    ? CHARACTERS.ananya
                    : form.stream === 'Finance'
                    ? CHARACTERS.rohanFinance
                    : CHARACTERS.rohanMarketing
                }
                size="sm"
              />
              <div>
                <div className="text-xs font-bold text-[#4A90E2]">
                  {section === 3
                    ? `${CHARACTERS.ananya.name} (${CHARACTERS.ananya.role})`
                    : form.stream === 'Finance'
                    ? `${CHARACTERS.rohanFinance.name} (${CHARACTERS.rohanFinance.role})`
                    : `${CHARACTERS.rohanMarketing.name} (${CHARACTERS.rohanMarketing.role})`}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 mt-0.5">
                  “
                  {section === 3
                    ? CHARACTERS.ananya.intro
                    : form.stream === 'Finance'
                    ? CHARACTERS.rohanFinance.intro
                    : CHARACTERS.rohanMarketing.intro}
                  ”
                </div>
              </div>
            </div>
          )}

          {/* Section 2 Data Dashboard */}
          {section === 2 && (
            <DashboardView
              dashboard={bank.dashboard}
              isGamified={isGamified}
            />
          )}

          {/* Question Card */}
          {currentQuestions[qIndex] && (
            <div
              className={
                isGamified
                  ? 'bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200'
                  : 'bg-white border border-slate-300 p-6'
              }
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-semibold uppercase tracking-wide">
                  {bank.sectionTitles[section]}
                </span>
                <span>
                  Question {qIndex + 1} of {currentQuestions.length}
                </span>
              </div>

              {isGamified && (
                <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0D9488] mb-3">
                  {currentQuestions[qIndex].tag}
                </div>
              )}

              <h3 className="text-base sm:text-lg font-semibold leading-relaxed text-[#2C2C2C]">
                {currentQuestions[qIndex].question}
              </h3>

              <div className="mt-5 space-y-3">
                {currentQuestions[qIndex].options.map((opt) => {
                  const isPicked =
                    (isGamified &&
                      answers[section]?.[currentQuestions[qIndex].id]
                        ?.selected === opt.id) ||
                    (!isGamified && tradSelected === opt.id);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(popup)}
                      onClick={() => {
                        if (isGamified) {
                          handleGamifiedAnswer(opt);
                        } else {
                          setTradSelected(opt.id);
                        }
                      }}
                      className={`w-full text-left p-4 transition flex items-start gap-3 ${
                        isGamified
                          ? `rounded-xl border-2 ${
                              isPicked
                                ? 'border-[#0D9488] bg-teal-50/60'
                                : 'border-slate-200 hover:border-[#4A90E2] hover:bg-slate-50'
                            }`
                          : `border ${
                              isPicked
                                ? 'border-slate-800 bg-slate-100'
                                : 'border-slate-300 hover:bg-slate-50'
                            }`
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isGamified
                            ? 'bg-slate-100 text-[#2C2C2C]'
                            : 'border border-slate-400 text-slate-700'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-sm leading-relaxed text-[#2C2C2C]">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Traditional Mode Explicit Next Button */}
              {!isGamified && (
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    disabled={!tradSelected}
                    onClick={handleTraditionalNext}
                    className="px-6 py-2.5 bg-[#2C2C2C] text-white text-sm font-semibold disabled:opacity-40"
                  >
                    {qIndex + 1 < currentQuestions.length
                      ? 'Next Question'
                      : section < 3
                      ? 'Complete Section'
                      : 'Finish Assessment'}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* 6. GAMIFIED SECTION COMPLETION BADGE TRANSITION */}
      {step === 'badge_transition' && isGamified && badgeTransitionSec && (
        <main className="min-h-[75vh] flex items-center justify-center px-5 bg-[#FFD93D]/25">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-lg border-2 border-[#FFD93D] animate-badge">
            <div className="w-16 h-16 rounded-full bg-[#FFD93D] text-[#2C2C2C] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
              Challenge {badgeTransitionSec} Complete
            </div>
            <h2 className="text-2xl font-bold mt-1">
              {bank.sectionBadges[badgeTransitionSec].title}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {bank.sectionBadges[badgeTransitionSec].desc}
            </p>
            <div className="text-xs text-slate-400 mt-5">
              Advancing to next stage...
            </div>
          </div>
        </main>
      )}

      {/* 7. 10-SECOND REFLECTION BUFFER */}
      {step === 'buffer' && (
        <main className="max-w-lg mx-auto px-5 py-20 text-center">
          <p className="text-base sm:text-lg font-medium text-[#2C2C2C] mb-6">
            Before you share your feedback, take a moment to reflect on your
            experience.
          </p>

          <div className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white border-2 border-[#4A90E2] text-[#2C2C2C] font-bold text-xl">
            00:{String(bufferLeft).padStart(2, '0')}
          </div>

          <div className="mt-8">
            <button
              disabled={bufferLeft > 0}
              onClick={() => setStep('survey')}
              className="px-8 py-3 rounded-lg bg-[#4A90E2] text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition"
            >
              Continue to Survey
            </button>
          </div>
        </main>
      )}

      {/* 8. POST-TEST SURVEY (IDENTICAL FOR BOTH MODES) */}
      {step === 'survey' && (
        <main className="max-w-2xl mx-auto px-5 py-10">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-xl font-bold">Post-Assessment Feedback</h2>
            <p className="text-sm text-slate-600 mt-1">
              You have completed all three sections of the assessment. Please
              share your feedback below (1 = Strongly Disagree, 5 = Strongly
              Agree).
            </p>

            <form onSubmit={handleSurveySubmit} className="mt-6 space-y-6">
              {/* Manipulation Check */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-sm font-semibold text-[#2C2C2C]">
                  How would you describe the format of the assessment you just
                  completed?
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 mb-2">
                  <span>1 — Very traditional and standard</span>
                  <span>5 — Very game-like and interactive</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setMcScore(num)}
                      className={`py-2 rounded-lg text-sm font-semibold border ${
                        mcScore === num
                          ? 'bg-[#4A90E2] text-white border-[#4A90E2]'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Construct Items */}
              {SURVEY_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  className="border-b border-slate-100 pb-4 last:border-none"
                >
                  <div className="text-sm font-medium text-[#2C2C2C] mb-2">
                    {idx + 1}. {item.text} *
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() =>
                          setSurvey((prev) => ({ ...prev, [item.id]: val }))
                        }
                        className={`py-2 rounded-lg text-xs sm:text-sm font-semibold border transition ${
                          survey[item.id] === val
                            ? 'bg-[#4A90E2] text-white border-[#4A90E2]'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Optional Open Feedback */}
              <div>
                <label className="block text-sm font-medium text-[#2C2C2C] mb-1">
                  Is there anything about the assessment experience you would
                  like to share? (Optional)
                </label>
                <textarea
                  maxLength={300}
                  rows={3}
                  value={openFeedback}
                  onChange={(e) => setOpenFeedback(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm"
                  placeholder="Optional comments (max 300 characters)..."
                />
              </div>

              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!allSurveyAnswered || submitting}
                className="w-full py-3.5 rounded-lg bg-[#4A90E2] text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition"
              >
                {submitting ? 'Submitting Responses...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </main>
      )}

      {/* 9. GAMIFIED RESULTS & BADGE SCREEN */}
      {step === 'results' && isGamified && (
        <main className="max-w-2xl mx-auto px-5 py-12">
          {(() => {
            const { s1, s2, s3, total } = computeScores();
            const tier = getBadgeTier(total);
            return (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200 text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white shadow-md animate-badge"
                  style={{ backgroundColor: tier.color }}
                >
                  <Award className="w-10 h-10" />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4">
                  Overall Performance Tier
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold mt-1"
                  style={{ color: tier.color }}
                >
                  {tier.tier}
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  {tier.desc}
                </p>

                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Total Score</div>
                  <div className="text-3xl font-bold text-[#2C2C2C]">
                    {total} <span className="text-base font-normal">/ 30</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="text-slate-500">Challenge 1</div>
                      <div className="font-bold">{s1} / 8</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="text-slate-500">Challenge 2</div>
                      <div className="font-bold">{s2} / 10</div>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <div className="text-slate-500">Challenge 3</div>
                      <div className="font-bold">{s3} / 12</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep('debrief')}
                  className="mt-6 px-8 py-3 rounded-lg bg-[#4A90E2] text-white font-semibold text-sm"
                >
                  Continue to Research Debrief
                </button>
              </div>
            );
          })()}
        </main>
      )}

      {/* 10. DEBRIEF & THANK YOU SCREEN */}
      {step === 'debrief' && (
        <main className="max-w-xl mx-auto px-5 py-16">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[#0D9488] font-bold text-lg mb-3">
              <CheckCircle2 className="w-6 h-6" />
              <span>Submission Recorded</span>
            </div>
            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                Thank you for participating in this research study. Your
                responses have been recorded and will be used solely for
                academic research purposes. Your data is completely confidential
                and anonymous.
              </p>
              <p>
                This assessment was part of an academic research study examining
                different campus recruitment assessment formats and their effect
                on candidate experience. Talvexo is a fictional company created
                solely for the purposes of this research study.
              </p>
              <p>
                We kindly request that you do not discuss the format or content
                of this assessment with fellow students who have not yet
                completed it, as this may affect the quality of the research.
              </p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

// ---------------- ADMIN DASHBOARD (/admin) ----------------

function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modeFilter, setModeFilter] = useState('All');
  const [streamFilter, setStreamFilter] = useState('All');

  async function fetchRows() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (!error && data) {
      setRows(data);
    }
    setLoading(false);
  }

  function handleLogin(e) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      setAuthed(true);
      setErr('');
      fetchRows();
    } else {
      setErr('Incorrect password.');
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
        <form
          onSubmit={handleLogin}
          className="max-w-sm w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShieldCheck className="w-5 h-5 text-[#4A90E2]" />
            <span>Research Admin Login</span>
          </div>
          {err && <div className="text-xs text-red-600 font-medium">{err}</div>}
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Enter Admin Password"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-[#4A90E2] text-white font-semibold text-sm"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  const filtered = rows.filter((r) => {
    if (modeFilter !== 'All' && r.mode_assigned !== modeFilter) return false;
    if (streamFilter !== 'All' && r.stream !== streamFilter) return false;
    return true;
  });

  const gamifiedRows = rows.filter((r) => r.mode_assigned === 'Gamified');
  const tradRows = rows.filter((r) => r.mode_assigned === 'Traditional');

  const avg = (arr, key) =>
    arr.length
      ? (arr.reduce((s, r) => s + Number(r[key] || 0), 0) / arr.length).toFixed(2)
      : '0.00';

  function exportCSV() {
    if (!filtered.length) return;
    const headers = Object.keys(filtered[0]);
    const csvLines = [
      headers.join(','),
      ...filtered.map((row) =>
        headers
          .map((h) => {
            const val =
              typeof row[h] === 'object' && row[h] !== null
                ? JSON.stringify(row[h])
                : row[h] ?? '';
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talvexo_research_data_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-[#2C2C2C]">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-bold text-lg">
          <BarChart3 className="w-5 h-5 text-[#4A90E2]" />
          <span>Talvexo Research Dashboard</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/?preview=true&mode=gamified&stream=marketing"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 text-[#0D9488] border border-teal-200 text-xs font-semibold"
          >
            <Eye className="w-4 h-4" />
            Preview Gamified
          </a>
          <a
            href="/?preview=true&mode=traditional&stream=finance"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold"
          >
            <Eye className="w-4 h-4" />
            Preview Traditional
          </a>
          <button
            onClick={fetchRows}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={() => setAuthed(false)}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Total Completed</div>
            <div className="text-2xl font-bold mt-1">{rows.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Mode Split (G / T)</div>
            <div className="text-2xl font-bold mt-1">
              {gamifiedRows.length} / {tradRows.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Avg Engagement (G vs T)</div>
            <div className="text-lg font-bold mt-1 text-[#0D9488]">
              {avg(gamifiedRows, 'engagement_avg')} vs{' '}
              {avg(tradRows, 'engagement_avg')}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">Avg Fairness (G vs T)</div>
            <div className="text-lg font-bold mt-1 text-[#4A90E2]">
              {avg(gamifiedRows, 'fairness_avg')} vs{' '}
              {avg(tradRows, 'fairness_avg')}
            </div>
          </div>
        </div>

        {/* Filter & Export Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium bg-white"
            >
              <option value="All">All Modes</option>
              <option value="Gamified">Gamified Only</option>
              <option value="Traditional">Traditional Only</option>
            </select>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium bg-white"
            >
              <option value="All">All Streams</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D9488] text-white text-xs font-semibold disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Export SPSS / Excel CSV ({filtered.length})
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading responses...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No responses recorded yet.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Stream / Role</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Score (/30)</th>
                  <th className="p-3">Engage</th>
                  <th className="p-3">Fair</th>
                  <th className="p-3">Attract</th>
                  <th className="p-3">MC</th>
                  <th className="p-3">Badge</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="p-3 font-medium">{r.full_name}</td>
                    <td className="p-3">{r.college_name}</td>
                    <td className="p-3">
                      {r.stream} ({r.role_title})
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          r.mode_assigned === 'Gamified'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {r.mode_assigned}
                      </span>
                    </td>
                    <td className="p-3 font-bold">{r.total_score}</td>
                    <td className="p-3">{r.engagement_avg}</td>
                    <td className="p-3">{r.fairness_avg}</td>
                    <td className="p-3">{r.attractiveness_avg}</td>
                    <td className="p-3">{r.manipulation_check ?? '-'}</td>
                    <td className="p-3">{r.performance_badge_tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
