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
                      <VolumeX className="w-4 h-4
