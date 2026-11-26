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
  MailWarning,
  Sparkles,
  Check,
  Coins,
  Lightbulb,
  Copy,
  HelpCircle,
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { soundEngine } from './sound';
import {
  SECTION_TIMERS,
  INITIAL_INTEL_TOKENS,
  CHARACTERS,
  QUESTION_BANK,
  SURVEY_ITEMS,
  getBadgeTier,
} from './questionsData';

import priyaImg from '../Priya.jpeg';
import rohanImg from '../Rohan.jpeg';
import ananyaImg from '../Ananya.jpeg';

const STORAGE_KEY = 'talvexo_assessment_progress_v3';
const ADMIN_PASSWORD = 'Admin@2025';

function formatTime(secs) {
  const m = Math.floor(Math.max(0, secs) / 60);
  const s = Math.max(0, secs) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function generateParticipantCode() {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `TVX-${digits}`;
}

/* Gamified Mode Character Portrait */
function CharacterAvatar({ char, size = 'md' }) {
  const dim =
    size === 'sm'
      ? 'w-14 h-14'
      : size === 'lg'
      ? 'w-24 h-24'
      : 'w-20 h-20';

  const isPriya = char.name.includes('Priya');
  const isRohan = char.name.includes('Rohan');
  const imgSrc = isPriya ? priyaImg : isRohan ? rohanImg : ananyaImg;

  const ringColor = isPriya
    ? 'border-teal-400 shadow-teal-200/60'
    : isRohan
    ? 'border-blue-400 shadow-blue-200/60'
    : 'border-amber-400 shadow-amber-200/60';

  return (
    <div
      className={`${dim} rounded-full overflow-hidden shadow-lg border-[3px] ${ringColor} bg-slate-100 shrink-0 relative select-none`}
    >
      <img
        src={imgSrc}
        alt={char.name}
        className="w-full h-full object-cover object-top"
      />
    </div>
  );
}

function CssConfetti({ count = 24 }) {
  const colors = ['#4A90E2', '#0D9488', '#F59E0B', '#FFD93D', '#38BDF8'];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-40">
      {Array.from({ length: count }).map((_, i) => {
        const left = `${(i * 100) / count + (i % 3)}%`;
        const delay = `${(i % 7) * 0.14}s`;
        const duration = `${1.9 + (i % 4) * 0.35}s`;
        const bg = colors[i % colors.length];
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left,
              backgroundColor: bg,
              animationDelay: delay,
              animationDuration: duration,
            }}
          />
        );
      })}
    </div>
  );
}

function MissionRoadmap({ currentSection, highlight = false }) {
  const stages = [
    { num: 1, label: 'Executive Briefs' },
    { num: 2, label: 'Analytics Terminal' },
    { num: 3, label: 'Compliance Desk' },
  ];

  return (
    <div
      className={`flex items-center justify-between max-w-xl mx-auto mt-2.5 pt-2 border-t border-slate-100 rounded-lg px-2 transition ${
        highlight ? 'ring-2 ring-[#0D9488] bg-teal-50/60' : ''
      }`}
    >
      {stages.map((st, idx) => {
        const done = currentSection > st.num;
        const active = currentSection === st.num;
        return (
          <React.Fragment key={st.num}>
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done
                    ? 'bg-[#0D9488] text-white'
                    : active
                    ? 'bg-[#4A90E2] text-white ring-4 ring-blue-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : st.num}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline ${
                  active
                    ? 'text-[#4A90E2]'
                    : done
                    ? 'text-[#0D9488]'
                    : 'text-slate-400'
                }`}
              >
                {st.label}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                  currentSection > st.num ? 'bg-[#0D9488]' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function TimerPill({ seconds, isGamified }) {
  let border = isGamified ? '#4A90E2' : '#64748B';
  let text = '#2C2C2C';
  let pulse = '';
  if (seconds <= 30) {
    border = '#E74C3C';
    text = '#E74C3C';
    if (isGamified) pulse = 'animate-pulse';
  } else if (seconds <= 120) {
    border = '#F5A623';
    text = '#B45309';
  }
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white font-semibold text-xs sm:text-sm ${
        isGamified ? 'rounded-full shadow-sm border-2' : 'border'
      } transition-colors ${pulse}`}
      style={{ borderColor: border, color: text }}
    >
      <Clock className="w-4 h-4 shrink-0" />
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
          ? 'bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-6'
          : 'border border-slate-300 p-4 mb-6 bg-white'
      }
    >
      {isGamified && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0D9488] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            Talvexo Live Analytics Terminal
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            FY Quarterly Feed
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {dashboard.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={
              isGamified
                ? 'bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl p-3.5 shadow-2xs'
                : 'border border-slate-300 p-3 bg-white'
            }
          >
            <div className="text-xs text-slate-500 font-medium">{kpi.label}</div>
            <div
              className={`text-lg sm:text-xl font-bold mt-1 ${
                isGamified ? 'text-[#0D9488]' : 'text-[#2C2C2C]'
              }`}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div
          className={
            isGamified
              ? 'bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4'
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
                  <span className="w-14 sm:w-16 font-medium text-slate-700 shrink-0 truncate">
                    {item.name}
                  </span>
                  <div className="flex-1 bg-slate-200 h-5 rounded-md overflow-hidden min-w-0">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${widthPct}%`,
                        background: isGamified
                          ? 'linear-gradient(90deg, #4A90E2, #0D9488)'
                          : '#475569',
                      }}
                    />
                  </div>
                  <span className="w-12 sm:w-14 text-right font-semibold text-slate-800 shrink-0">
                    ₹{item.value}L
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className={
            isGamified
              ? 'bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4'
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
                  <div
                    key={seg.name}
                    className="flex items-center justify-between text-xs border-b border-slate-200 pb-1.5 gap-2"
                  >
                    <span className="font-medium text-slate-700">{seg.name}</span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
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
              <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full min-w-[290px] text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500">
                      <th className="py-1.5 pr-2">Metric</th>
                      <th className="py-1.5 px-2 whitespace-nowrap">Q3</th>
                      <th className="py-1.5 pl-2 whitespace-nowrap">Q4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.pnlRows.map((row) => (
                      <tr key={row.metric} className="border-b border-slate-200">
                        <td className="py-1.5 pr-2 font-medium text-slate-700">
                          {row.metric}
                        </td>
                        <td className="py-1.5 px-2 text-slate-600 whitespace-nowrap">
                          {row.q3}
                        </td>
                        <td className="py-1.5 pl-2 font-semibold text-slate-800 whitespace-nowrap">
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
  const [participantCode, setParticipantCode] = useState(() =>
    generateParticipantCode()
  );
  const [copiedCode, setCopiedCode] = useState(false);

  const [section, setSection] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECTION_TIMERS[1]);
  const [answers, setAnswers] = useState({ 1: {}, 2: {}, 3: {} });
  const [sectionTimes, setSectionTimes] = useState({ 1: 0, 2: 0, 3: 0 });
  const [tradError, setTradError] = useState('');

  const [tabSwitches, setTabSwitches] = useState(0);
  const [questionTimings, setQuestionTimings] = useState({});
  const questionStartRef = useRef(Date.now());

  const [tourStep, setTourStep] = useState(0);

  const [tokensLeft, setTokensLeft] = useState(INITIAL_INTEL_TOKENS);
  const [unlockedClues, setUnlockedClues] = useState({});

  const [popup, setPopup] = useState(null);
  const [badgeTransitionSec, setBadgeTransitionSec] = useState(null);
  const [previewSimulatedScore, setPreviewSimulatedScore] = useState(null);

  const [bufferLeft, setBufferLeft] = useState(10);

  const [mcFormatScore, setMcFormatScore] = useState(0);
  const [mcTokensAnswer, setMcTokensAnswer] = useState('');
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

  useEffect(() => {
    const styleId = 'talvexo-character-fx-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes confettiFall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(540deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          top: -12px;
          width: 9px;
          height: 14px;
          border-radius: 2px;
          animation-name: confettiFall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .confetti-piece { animation: none; }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (step !== 'assessment') return;
    function handleVisibilityChange() {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [step]);

  useEffect(() => {
    if (step === 'assessment') {
      questionStartRef.current = Date.now();
    }
  }, [step, section, qIndex]);

  useEffect(() => {
    if (!isGamified || step !== 'assessment' || popup || tourStep > 0) return;
    function onKeyDown(e) {
      const key = e.key.toUpperCase();
      if (key === 'A' || key === 'B' || key === 'C') {
        const q = currentQuestions[qIndex];
        const opt = q?.options.find((o) => o.id === key);
        if (opt) {
          handleGamifiedAnswer(opt);
        }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [step, popup, tourStep, currentQuestions, qIndex, isGamified]);

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
      // Ignore
    }
  }, [isPreview]);

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
            participantCode,
            section,
            qIndex,
            timeLeft,
            answers,
            sectionTimes,
            tabSwitches,
            questionTimings,
            tokensLeft,
            unlockedClues,
            step: 'assessment',
            savedAt: Date.now(),
          })
        );
      } catch {
        // Ignore
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [
    isPreview,
    step,
    form,
    mode,
    randomDecimal,
    participantCode,
    section,
    qIndex,
    timeLeft,
    answers,
    sectionTimes,
    tabSwitches,
    questionTimings,
    tokensLeft,
    unlockedClues,
  ]);

  useEffect(() => {
    if (step !== 'assessment' || popup || tourStep > 0) return;
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
  }, [step, section, popup, tourStep, isGamified]);

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

  function recordQuestionDuration(qId) {
    const elapsedSec = Number(
      ((Date.now() - questionStartRef.current) / 1000).toFixed(1)
    );
    setQuestionTimings((prev) => ({
      ...prev,
      [qId]: (prev[qId] || 0) + elapsedSec,
    }));
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
  }

  function handleUnlockClue(questionId) {
    if (tokensLeft <= 0 || unlockedClues[questionId]) return;
    soundEngine.playClick();
    setTokensLeft((t) => t - 1);
    setUnlockedClues((prev) => ({ ...prev, [questionId]: true }));
  }

  function handlePreviewJump(target) {
    setPopup(null);
    setTradError('');
    setTourStep(0);
    if (target === 'sec1') {
      setSection(1);
      setQIndex(0);
      setTimeLeft(SECTION_TIMERS[1]);
      setStep('assessment');
    } else if (target === 'sec2') {
      setSection(2);
      setQIndex(0);
      setTimeLeft(SECTION_TIMERS[2]);
      setStep('assessment');
    } else if (target === 'sec3') {
      setSection(3);
      setQIndex(0);
      setTimeLeft(SECTION_TIMERS[3]);
      setStep('assessment');
    } else if (target === 'badge_transition') {
      setMode('Gamified');
      setBadgeTransitionSec(section);
      setStep('badge_transition');
    } else if (target === 'results') {
      setMode('Gamified');
      setStep('results');
    } else {
      setStep(target);
    }
  }

  function handleResumeSaved() {
    if (!resumeOffer) return;
    setForm(resumeOffer.form);
    setMode(resumeOffer.mode);
    setRandomDecimal(resumeOffer.randomDecimal);
    if (resumeOffer.participantCode) {
      setParticipantCode(resumeOffer.participantCode);
    }
    setSection(resumeOffer.section);
    setQIndex(resumeOffer.qIndex);
    setTimeLeft(resumeOffer.timeLeft);
    setAnswers(resumeOffer.answers);
    setSectionTimes(resumeOffer.sectionTimes || { 1: 0, 2: 0, 3: 0 });
    setTabSwitches(resumeOffer.tabSwitches || 0);
    setQuestionTimings(resumeOffer.questionTimings || {});
    setTokensLeft(
      typeof resumeOffer.tokensLeft === 'number'
        ? resumeOffer.tokensLeft
        : INITIAL_INTEL_TOKENS
    );
    setUnlockedClues(resumeOffer.unlockedClues || {});
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
    setParticipantCode(generateParticipantCode());

    setSection(1);
    setQIndex(0);
    setTimeLeft(SECTION_TIMERS[1]);
    setAnswers({ 1: {}, 2: {}, 3: {} });
    setTradError('');
    setTabSwitches(0);
    setQuestionTimings({});
    setTokensLeft(INITIAL_INTEL_TOKENS);
    setUnlockedClues({});

    if (assigned === 'Gamified') {
      soundEngine.playClick();
      setStep('welcome');
    } else {
      setStep('trad_welcome');
    }
  }

  function handleSectionComplete(timedOut = false) {
    const spent = SECTION_TIMERS[section] - (timedOut ? 0 : timeLeft);
    setSectionTimes((prev) => ({ ...prev, [section]: spent }));
    setPopup(null);
    setTradError('');
    warnedRef.current = false;

    if (isGamified) {
      soundEngine.playBadge();
      setBadgeTransitionSec(section);
      setStep('badge_transition');
      if (!isPreview) {
        setTimeout(() => {
          setBadgeTransitionSec(null);
          advanceAfterSection(section);
        }, 3500);
      }
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
    if (popup || tourStep > 0) return;
    const q = currentQuestions[qIndex];
    recordQuestionDuration(q.id);

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
    }, 2000);
  }

  function handleTraditionalSectionSubmit(e) {
    e.preventDefault();
    const sectionAns = answers[section] || {};
    const allAnswered = currentQuestions.every((q) => Boolean(sectionAns[q.id]));
    if (!allAnswered) {
      setTradError(
        'Please answer every question in this section before continuing.'
      );
      return;
    }
    setTradError('');
    currentQuestions.forEach((q) => recordQuestionDuration(q.id));
    handleSectionComplete(false);
  }

  function computeScores() {
    if (isPreview && previewSimulatedScore !== null) {
      if (previewSimulatedScore === 28)
        return { s1: 8, s2: 8, s3: 12, total: 28 };
      if (previewSimulatedScore === 21)
        return { s1: 6, s2: 7, s3: 8, total: 21 };
      if (previewSimulatedScore === 14)
        return { s1: 4, s2: 6, s3: 4, total: 14 };
      return { s1: 2, s2: 4, s3: 0, total: 6 };
    }
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

  const allSurveyAnswered =
    mcFormatScore > 0 &&
    mcTokensAnswer !== '' &&
    SURVEY_ITEMS.every((item) => survey[item.id] > 0);

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
    const clarityCompAvg = Number(
      ((survey.q10 + survey.q11 + survey.q12) / 3).toFixed(2)
    );
    const attnPassed = survey.attn_check === 4;

    const isMobile =
      typeof navigator !== 'undefined' &&
      /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    const tokensSpent = isGamified ? INITIAL_INTEL_TOKENS - tokensLeft : 0;

    const payload = {
      participant_code: participantCode,
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
      tab_switches: tabSwitches,
      question_timings: questionTimings,
      tokens_used: tokensSpent,
      manipulation_check: mcFormatScore,
      manipulation_check_tokens: mcTokensAnswer,
      attention_check_passed: attnPassed,
      q1: survey.q1,
      q2: survey.q2,
      q3: survey.q3,
      q4: survey.q4,
      q5: survey.q5,
      q6: survey.q6,
      q7: survey.q7,
      q8: survey.q8,
      q9: survey.q9,
      q10: survey.q10,
      q11: survey.q11,
      q12: survey.q12,
      m1: survey.q10,
      m2: survey.q11,
      m3: survey.q12,
      open_feedback: openFeedback.trim() || null,
      engagement_avg: engAvg,
      fairness_avg: fairAvg,
      attractiveness_avg: attrAvg,
      clarity_competence_avg: clarityCompAvg,
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

  function handleCopyCode() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(participantCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  }

  return (
    <div
      className={`min-h-screen font-sans ${
        isGamified &&
        step !== 'landing' &&
        step !== 'consent' &&
        step !== 'register'
          ? 'bg-gradient-to-br from-slate-100 via-teal-50/40 to-blue-50/50'
          : 'bg-white'
      } text-[#2C2C2C]`}
    >
      {isPreview && (
        <div className="bg-slate-900 text-white text-xs px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-amber-500">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold">
              PREVIEW SANDBOX
            </span>
            <span className="text-slate-300 hidden sm:inline">
              No data written to Supabase
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                setMode(mode === 'Gamified' ? 'Traditional' : 'Gamified')
              }
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 rounded font-semibold"
            >
              Mode: <span className="text-amber-400">{mode}</span>
            </button>

            <button
              onClick={() =>
                setForm((f) => ({
                  ...f,
                  stream: f.stream === 'Marketing' ? 'Finance' : 'Marketing',
                }))
              }
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 py-1 rounded font-semibold"
            >
              Stream: <span className="text-teal-400">{form.stream}</span>
            </button>

            {isGamified && (
              <button
                onClick={() => {
                  setTokensLeft(INITIAL_INTEL_TOKENS);
                  setUnlockedClues({});
                }}
                className="bg-amber-600/30 hover:bg-amber-600/50 border border-amber-400 text-amber-200 px-2.5 py-1 rounded font-semibold"
              >
                Reset Tokens ({tokensLeft}/4)
              </button>
            )}

            <select
              value={step === 'assessment' ? `sec${section}` : step}
              onChange={(e) => handlePreviewJump(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-2.5 py-1 font-semibold text-white"
            >
              <option value="landing">Screen: 1. Landing Page</option>
              <option value="consent">Screen: 2. Consent</option>
              <option value="register">Screen: 3. Registration</option>
              <option value="trad_welcome">
                Screen: 4a. Traditional Welcome
              </option>
              <option value="welcome">Screen: 4b. Gamified Welcome</option>
              <option value="sec1">Screen: 5. Section 1</option>
              <option value="sec2">Screen: 6. Section 2</option>
              <option value="sec3">Screen: 7. Section 3</option>
              <option value="badge_transition">
                Screen: 8. Badge Transition (G)
              </option>
              <option value="buffer">Screen: 9. 10s Buffer</option>
              <option value="survey">Screen: 10. Post-Test Survey</option>
              <option value="results">Screen: 11. Results & Badge (G)</option>
              <option value="debrief">Screen: 12. Debrief</option>
            </select>

            {isGamified && step === 'assessment' && (
              <select
                value={qIndex}
                onChange={(e) => {
                  setPopup(null);
                  setQIndex(Number(e.target.value));
                }}
                className="bg-slate-800 border border-slate-600 rounded px-2.5 py-1 font-semibold text-amber-300"
              >
                {currentQuestions.map((q, idx) => (
                  <option key={q.id} value={idx}>
                    Question {idx + 1} of {currentQuestions.length}
                  </option>
                ))}
              </select>
            )}

            {step === 'results' && (
              <select
                value={previewSimulatedScore ?? 28}
                onChange={(e) =>
                  setPreviewSimulatedScore(Number(e.target.value))
                }
                className="bg-slate-800 border border-slate-600 rounded px-2.5 py-1 font-semibold text-teal-300"
              >
                <option value={28}>Simulate: Top Strategist (28/30)</option>
                <option value={21}>Simulate: Skilled Analyst (21/30)</option>
                <option value={14}>Simulate: Developing Trainee (14/30)</option>
                <option value={6}>Simulate: Needs Practice (6/30)</option>
              </select>
            )}

            <a
              href="/admin"
              className="bg-red-600 hover:bg-red-500 text-white px-2.5 py-1 rounded font-semibold"
            >
              Exit Preview
            </a>
          </div>
        </div>
      )}

      {(step === 'welcome' ||
        step === 'assessment' ||
        (isGamified && step === 'badge_transition')) && (
        <header
          className={`sticky top-0 z-30 px-3 sm:px-4 py-3 border-b ${
            isGamified
              ? 'bg-white/95 backdrop-blur border-slate-200 shadow-xs'
              : 'bg-white border-slate-300'
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {isGamified && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#0D9488] text-white font-bold text-sm flex items-center justify-center shadow-2xs shrink-0">
                  T
                </div>
              )}
              <div className="truncate">
                <div className="text-xs text-slate-500 font-medium truncate">
                  {form.full_name}
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#2C2C2C] truncate">
                  Role: {roleTitle}
                </div>
              </div>
            </div>

            {step === 'assessment' && (
              <div className="flex items-center gap-2 sm:gap-3">
                {isGamified && (
                  <div
                    title="Limited resource: spend 1 token on any question to reveal an analyst clue"
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold border-2 transition ${
                      tourStep === 1
                        ? 'ring-4 ring-amber-300 scale-105 bg-amber-100 border-amber-500 text-amber-950'
                        : tokensLeft > 0
                        ? 'bg-amber-50 border-amber-400 text-amber-900'
                        : 'bg-slate-100 border-slate-300 text-slate-500'
                    }`}
                  >
                    <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Tokens: {tokensLeft}/{INITIAL_INTEL_TOKENS}
                    </span>
                  </div>
                )}

                {isGamified && (
                  <button
                    onClick={toggleMute}
                    title={muted ? 'Unmute sound' : 'Mute sound'}
                    className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}

                <TimerPill seconds={timeLeft} isGamified={isGamified} />
              </div>
            )}
          </div>

          {step === 'assessment' && (
            <div className="max-w-4xl mx-auto">
              {isGamified ? (
                <MissionRoadmap
                  currentSection={section}
                  highlight={tourStep === 2}
                />
              ) : (
                <div className="text-xs font-medium text-slate-600 mt-2">
                  Section {section} of 3 — {bank.sectionTitles[section]}
                </div>
              )}
            </div>
          )}
        </header>
      )}

      {isGamified && step === 'assessment' && tourStep > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-teal-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed">
                {tourStep === 1 ? (
                  <>
                    <span className="font-bold text-amber-300">
                      Quick Tip (1/2) — Intel Tokens:{' '}
                    </span>
                    You have <strong>4 Intel Tokens</strong> for the entire
                    simulation. Spend 1 token on any tough question to reveal an
                    analyst clue!
                  </>
                ) : (
                  <>
                    <span className="font-bold text-teal-300">
                      Quick Tip (2/2) — Mission Roadmap:{' '}
                    </span>
                    Track your progress across all 3 business rounds above.
                    Watch the timer pill—each round has its own clock!
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                if (tourStep === 1) {
                  setTourStep(2);
                } else {
                  setTourStep(0);
                  questionStartRef.current = Date.now();
                }
              }}
              className="px-4 py-2 rounded-lg bg-[#0D9488] hover:bg-teal-500 text-white text-xs font-bold shrink-0 self-end sm:self-center"
            >
              {tourStep === 1 ? 'Next Tip →' : 'Got It, Start!'}
            </button>
          </div>
        </div>
      )}

      {isGamified && popup && (
        <div className="fixed top-24 left-1/2 z-50 w-[92%] max-w-md animate-pop-in">
          <div className="bg-white border-2 border-[#0D9488] rounded-2xl p-4 shadow-2xl flex items-center gap-4">
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

      {/* 4A. PLAIN TRADITIONAL WELCOME SCREEN */}
      {step === 'trad_welcome' && (
        <main className="max-w-2xl mx-auto px-5 py-12">
          <div className="bg-white border border-slate-300 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold text-[#2C2C2C]">
              Assessment Overview
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              This assessment evaluates candidates for the{' '}
              <strong>{roleTitle}</strong> position across three multiple-choice
              sections covering quantitative/analytical reasoning, data and
              domain interpretation, and workplace judgment.
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
              <li>
                <strong>Section 1 ({formatTime(SECTION_TIMERS[1])}):</strong>{' '}
                {bank.sectionTitles[1]}
              </li>
              <li>
                <strong>Section 2 ({formatTime(SECTION_TIMERS[2])}):</strong>{' '}
                {bank.sectionTitles[2]}
              </li>
              <li>
                <strong>Section 3 ({formatTime(SECTION_TIMERS[3])}):</strong>{' '}
                {bank.sectionTitles[3]}
              </li>
            </ul>
            <p className="text-sm text-slate-700 leading-relaxed">
              Each section has its own timer and is submitted as a complete set
              of questions. Please answer all questions carefully before moving to
              the next section.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  questionStartRef.current = Date.now();
                  setStep('assessment');
                }}
                className="px-6 py-2.5 bg-[#2C2C2C] hover:bg-slate-800 text-white text-sm font-semibold"
              >
                Start Assessment
              </button>
            </div>
          </div>
        </main>
      )}

      {/* 4B. GAMIFIED WELCOME SCREEN */}
      {step === 'welcome' && (
        <main className="max-w-2xl mx-auto px-5 py-12">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CharacterAvatar char={CHARACTERS.priya} size="lg" />
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0D9488] text-xs font-bold uppercase tracking-wide">
                  {CHARACTERS.priya.name} • {CHARACTERS.priya.role}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  Welcome to Your {roleTitle} Simulation
                </h2>
              </div>
            </div>

            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 text-sm text-[#2C2C2C] leading-relaxed">
              “
              {form.stream === 'Finance'
                ? CHARACTERS.priya.welcomeFinance
                : CHARACTERS.priya.welcomeMarketing}
              ”
            </div>

            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Coins className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950 leading-relaxed">
                <span className="font-bold">
                  Limited Resource Rule (4 Intel Tokens):
                </span>{' '}
                You start with{' '}
                <span className="font-bold">4 Intel Tokens</span> across all 12
                decisions. On any tough question, you can spend{' '}
                <span className="font-bold">1 Intel Token</span> to unlock an
                analyst clue from Rohan or Ananya. Once spent, tokens do not
                replenish—budget them strategically!
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200">
                <div className="font-bold text-[#4A90E2]">Challenge 1 • 8m</div>
                <div className="text-slate-700 font-medium mt-1">
                  {bank.sectionTitles[1]}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200">
                <div className="font-bold text-[#0D9488]">Challenge 2 • 8m</div>
                <div className="text-slate-700 font-medium mt-1">
                  {bank.sectionTitles[2]}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="font-bold text-[#D97706]">Challenge 3 • 6m</div>
                <div className="text-slate-700 font-medium mt-1">
                  {bank.sectionTitles[3]}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setTourStep(1);
                setStep('assessment');
              }}
              className="mt-6 w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4A90E2] to-[#0D9488] hover:opacity-95 text-white font-semibold text-sm shadow-md transition"
            >
              Launch Challenge 1 →
            </button>
          </div>
        </main>
      )}

      {/* 5A. GAMIFIED ASSESSMENT SCREEN */}
      {step === 'assessment' && isGamified && (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {qIndex === 0 && (
            <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200 shadow-xs flex items-center gap-4">
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
                    ? `${CHARACTERS.ananya.name} • ${CHARACTERS.ananya.role}`
                    : form.stream === 'Finance'
                    ? `${CHARACTERS.rohanFinance.name} • ${CHARACTERS.rohanFinance.role}`
                    : `${CHARACTERS.rohanMarketing.name} • ${CHARACTERS.rohanMarketing.role}`}
                </div>
                <div className="text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">
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

          {section === 2 && (
            <DashboardView dashboard={bank.dashboard} isGamified={true} />
          )}

          {currentQuestions[qIndex] && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-md border border-slate-200">
              {section === 3 && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <MailWarning className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      TALVEXO PRIORITY MEMO • {currentQuestions[qIndex].tag}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-200/70 text-amber-900 shrink-0">
                    Action Required
                  </span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                <span className="font-semibold uppercase tracking-wide">
                  {bank.sectionTitles[section]}
                </span>
                <span className="font-semibold">
                  Decision {qIndex + 1} of {currentQuestions.length}
                </span>
              </div>

              {section !== 3 && (
                <div className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0D9488] mb-3">
                  {currentQuestions[qIndex].tag}
                </div>
              )}

              {section === 1 && currentQuestions[qIndex].briefStats && (
                <div className="flex flex-wrap gap-2 mb-3.5">
                  {currentQuestions[qIndex].briefStats.map((stat, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-[#1E3A8A]"
                    >
                      {stat}
                    </span>
                  ))}
                </div>
              )}

              <h3 className="text-base sm:text-lg font-semibold leading-relaxed text-[#2C2C2C]">
                {currentQuestions[qIndex].question}
              </h3>

              <div className="mt-4">
                {unlockedClues[currentQuestions[qIndex].id] ? (
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 flex items-start gap-2.5 text-xs sm:text-sm text-amber-950">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Unlocked Analyst Clue: </span>
                      {currentQuestions[qIndex].clue}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={
                      tokensLeft <= 0 || Boolean(popup) || tourStep > 0
                    }
                    onClick={() => handleUnlockClue(currentQuestions[qIndex].id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
                      tokensLeft > 0
                        ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    {tokensLeft > 0
                      ? `Spend 1 Intel Token to Reveal Clue (${tokensLeft} left)`
                      : '0 Intel Tokens Remaining'}
                  </button>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {currentQuestions[qIndex].options.map((opt) => {
                  const isPicked =
                    answers[section]?.[currentQuestions[qIndex].id]?.selected ===
                    opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={Boolean(popup) || tourStep > 0}
                      onClick={() => handleGamifiedAnswer(opt)}
                      className={`w-full text-left p-3.5 sm:p-4 transition-all flex items-start gap-3 sm:gap-3.5 rounded-xl border-2 hover:-translate-y-0.5 hover:shadow-sm ${
                        isPicked
                          ? 'border-[#0D9488] bg-teal-50/70 ring-2 ring-teal-200'
                          : 'border-slate-200 hover:border-[#4A90E2] hover:bg-blue-50/30'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isPicked
                            ? 'bg-[#0D9488] text-white'
                            : 'bg-slate-100 text-[#2C2C2C]'
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

              <div className="mt-4 text-[11px] text-slate-400 text-right hidden sm:block">
                Tip: You can also press keys A, B, or C to select
              </div>
            </div>
          )}
        </main>
      )}

      {/* 5B. TRADITIONAL ASSESSMENT SCREEN */}
      {step === 'assessment' && !isGamified && (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          {section === 2 && (
            <DashboardView dashboard={bank.dashboard} isGamified={false} />
          )}

          <form onSubmit={handleTraditionalSectionSubmit} className="space-y-5">
            {currentQuestions.map((q, idx) => {
              const selectedOptId = answers[section]?.[q.id]?.selected || '';
              return (
                <div
                  key={q.id}
                  className="bg-white border border-slate-300 rounded-md p-5 sm:p-6"
                >
                  <div className="text-sm font-semibold text-[#2C2C2C] leading-relaxed">
                    {idx + 1}. {q.question} *
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {q.options.map((opt) => {
                      const checked = selectedOptId === opt.id;
                      return (
                        <label
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded border cursor-pointer text-sm ${
                            checked
                              ? 'border-slate-800 bg-slate-100 font-medium'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt.id}
                            checked={checked}
                            onChange={() => {
                              setTradError('');
                              setAnswers((prev) => ({
                                ...prev,
                                [section]: {
                                  ...(prev[section] || {}),
                                  [q.id]: {
                                    selected: opt.id,
                                    marks: opt.marks,
                                  },
                                },
                              }));
                            }}
                            className="mt-1 accent-[#2C2C2C]"
                          />
                          <span className="leading-relaxed">
                            <strong className="mr-1.5">{opt.id}.</strong>
                            {opt.text}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {tradError && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                {tradError}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-7 py-3 rounded bg-[#2C2C2C] hover:bg-slate-800 text-white text-sm font-semibold transition"
              >
                {section < 3 ? 'Next Section' : 'Submit Assessment'}
              </button>
            </div>
          </form>
        </main>
      )}

      {/* 6. GAMIFIED SECTION COMPLETION BADGE TRANSITION */}
      {isGamified && step === 'badge_transition' && badgeTransitionSec && (
        <main className="min-h-[75vh] flex items-center justify-center px-5 bg-[#FFD93D]/20 relative">
          <CssConfetti count={20} />
          <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-xl border-2 border-[#FFD93D] animate-badge relative z-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD93D] to-[#F59E0B] text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#0D9488]">
              Challenge {badgeTransitionSec} Cleared
            </div>
            <h2 className="text-2xl font-bold mt-1">
              {bank.sectionBadges[badgeTransitionSec].title}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {bank.sectionBadges[badgeTransitionSec].desc}
            </p>
            {isPreview ? (
              <button
                onClick={() => {
                  setBadgeTransitionSec(null);
                  advanceAfterSection(badgeTransitionSec);
                }}
                className="mt-5 px-5 py-2 rounded-lg bg-[#4A90E2] text-white text-xs font-semibold"
              >
                Continue to Next Stage (Preview)
              </button>
            ) : (
              <div className="text-xs text-slate-400 mt-5">
                Advancing to next stage...
              </div>
            )}
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
              disabled={bufferLeft > 0 && !isPreview}
              onClick={() => setStep('survey')}
              className="px-8 py-3 rounded-lg bg-[#4A90E2] text-white font-semibold text-sm disabled:opacity-40 hover:bg-blue-600 transition"
            >
              Continue to Survey
            </button>
          </div>
        </main>
      )}

      {/* 8. POST-TEST SURVEY */}
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
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-sm font-semibold text-[#2C2C2C]">
                  1. How would you describe the format of the assessment you just
                  completed? *
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1 mb-2">
                  <span>1 — Very traditional</span>
                  <span>5 — Very game-like</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setMcFormatScore(num)}
                      className={`py-2 rounded-lg text-sm font-semibold border ${
                        mcFormatScore === num
                          ? 'bg-[#4A90E2] text-white border-[#4A90E2]'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-sm font-semibold text-[#2C2C2C] mb-3">
                  2. Did this assessment require you to manage limited resources
                  (such as tokens) to reveal information? *
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['Yes', 'No'].map((choice) => (
                    <button
                      type="button"
                      key={choice}
                      onClick={() => setMcTokensAnswer(choice)}
                      className={`py-2 rounded-lg text-sm font-semibold border ${
                        mcTokensAnswer === choice
                          ? 'bg-[#4A90E2] text-white border-[#4A90E2]'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {SURVEY_ITEMS.map((item, idx) => (
                <div
                  key={item.id}
                  className="border-b border-slate-100 pb-4 last:border-none"
                >
                  <div className="text-sm font-medium text-[#2C2C2C] mb-2">
                    {idx + 3}. {item.text} *
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
      {isGamified && step === 'results' && (
        <main className="max-w-2xl mx-auto px-5 py-12 relative">
          <CssConfetti count={30} />
          {(() => {
            const { s1, s2, s3, total } = computeScores();
            const tier = getBadgeTier(total);
            return (
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200 text-center relative z-10">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white shadow-md animate-badge"
                  style={{ backgroundColor: tier.color }}
                >
                  <Award className="w-10 h-10" />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4">
                  Performance Tier Earned
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

                <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs text-slate-500">Total Score</div>
                  <div className="text-3xl font-bold text-[#2C2C2C]">
                    {total} <span className="text-base font-normal">/ 30</span>
                  </div>
                  <div className="text-xs text-amber-800 font-semibold mt-1">
                    Intel Tokens Used: {INITIAL_INTEL_TOKENS - tokensLeft} of{' '}
                    {INITIAL_INTEL_TOKENS}
                  </div>

                  <div className="mt-5 space-y-3 text-left text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Challenge 1: Aptitude</span>
                        <span>{s1} / 8</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#4A90E2]"
                          style={{ width: `${(s1 / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Challenge 2: Data & Domain</span>
                        <span>{s2} / 10</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0D9488]"
                          style={{ width: `${(s2 / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>Challenge 3: Integrity & Ethics</span>
                        <span>{s3} / 12</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#F59E0B]"
                          style={{ width: `${(s3 / 12) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-5 text-xs">
                  {[1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200"
                    >
                      <div className="font-bold text-amber-900">
                        {bank.sectionBadges[num].title}
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        Challenge {num}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep('debrief')}
                  className="mt-6 px-8 py-3 rounded-lg bg-[#4A90E2] hover:bg-blue-600 text-white font-semibold text-sm transition"
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

            <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Participant Completion Code
                </div>
                <div className="text-xl font-mono font-bold text-[#2C2C2C] mt-0.5">
                  {participantCode}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
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

  function exportSPSSCSV() {
    if (!filtered.length) return;
    const spssHeaders = [
      'participant_code',
      'submitted_at',
      'full_name',
      'college_name',
      'email',
      'gender',
      'gender_code',
      'age',
      'gaming_frequency',
      'gaming_type',
      'prior_gamified_experience',
      'prior_exp_code',
      'stream',
      'stream_code',
      'mode_assigned',
      'mode_code',
      'random_decimal',
      'device_type',
      'section1_score',
      'section2_score',
      'section3_score',
      'total_score',
      'section1_time_seconds',
      'section2_time_seconds',
      'section3_time_seconds',
      'tokens_used',
      'tab_switches',
      'manipulation_check_format',
      'manipulation_check_tokens',
      'mc_tokens_code',
      'attention_check_passed',
      'q1',
      'q2',
      'q3',
      'q4',
      'q5',
      'q6',
      'q7',
      'q8',
      'q9',
      'q10',
      'q11',
      'q12',
      'engagement_avg',
      'fairness_avg',
      'attractiveness_avg',
      'clarity_competence_avg',
      'performance_badge_tier',
      'open_feedback',
      'question_timings',
    ];

    const csvLines = [
      spssHeaders.join(','),
      ...filtered.map((r) => {
        const mapped = {
          participant_code: r.participant_code ?? '',
          submitted_at: r.submitted_at ?? '',
          full_name: r.full_name ?? '',
          college_name: r.college_name ?? '',
          email: r.email ?? '',
          gender: r.gender ?? '',
          gender_code:
            r.gender === 'Male' ? 1 : r.gender === 'Female' ? 2 : 3,
          age: r.age ?? '',
          gaming_frequency: r.gaming_frequency ?? '',
          gaming_type: r.gaming_type ?? '',
          prior_gamified_experience: r.prior_gamified_experience ?? '',
          prior_exp_code: r.prior_gamified_experience === 'Yes' ? 1 : 0,
          stream: r.stream ?? '',
          stream_code: r.stream === 'Finance' ? 2 : 1,
          mode_assigned: r.mode_assigned ?? '',
          mode_code: r.mode_assigned === 'Gamified' ? 1 : 0,
          random_decimal: r.random_decimal ?? '',
          device_type: r.device_type ?? '',
          section1_score: r.section1_score ?? 0,
          section2_score: r.section2_score ?? 0,
          section3_score: r.section3_score ?? 0,
          total_score: r.total_score ?? 0,
          section1_time_seconds: r.section1_time_seconds ?? 0,
          section2_time_seconds: r.section2_time_seconds ?? 0,
          section3_time_seconds: r.section3_time_seconds ?? 0,
          tokens_used: r.tokens_used ?? 0,
          tab_switches: r.tab_switches ?? 0,
          manipulation_check_format: r.manipulation_check ?? '',
          manipulation_check_tokens: r.manipulation_check_tokens ?? '',
          mc_tokens_code: r.manipulation_check_tokens === 'Yes' ? 1 : 0,
          attention_check_passed:
            r.attention_check_passed === true
              ? 1
              : r.attention_check_passed === false
              ? 0
              : '',
          q1: r.q1 ?? '',
          q2: r.q2 ?? '',
          q3: r.q3 ?? '',
          q4: r.q4 ?? '',
          q5: r.q5 ?? '',
          q6: r.q6 ?? '',
          q7: r.q7 ?? '',
          q8: r.q8 ?? '',
          q9: r.q9 ?? '',
          q10: r.q10 ?? '',
          q11: r.q11 ?? '',
          q12: r.q12 ?? '',
          engagement_avg: r.engagement_avg ?? '',
          fairness_avg: r.fairness_avg ?? '',
          attractiveness_avg: r.attractiveness_avg ?? '',
          clarity_competence_avg: r.clarity_competence_avg ?? '',
          performance_badge_tier: r.performance_badge_tier ?? '',
          open_feedback: r.open_feedback ?? '',
          question_timings: r.question_timings
            ? JSON.stringify(r.question_timings)
            : '',
        };

        return spssHeaders
          .map((h) => `"${String(mapped[h] ?? '').replace(/"/g, '""')}"`)
          .join(',');
      }),
    ];

    const blob = new Blob([csvLines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talvexo_SPSS_ready_${new Date()
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
            Open Full Preview Sandbox
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
            <div className="text-xs text-slate-500">Avg Enjoyment (G vs T)</div>
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
            onClick={exportSPSSCSV}
            disabled={!filtered.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0D9488] text-white text-xs font-semibold disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Export SPSS-Ready CSV ({filtered.length})
          </button>
        </div>

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
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Stream</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Tokens</th>
                  <th className="p-3">Tabs</th>
                  <th className="p-3">Attn</th>
                  <th className="p-3">Enjoy</th>
                  <th className="p-3">Fair</th>
                  <th className="p-3">Tier</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="p-3 font-mono font-semibold text-slate-600">
                      {r.participant_code ?? '-'}
                    </td>
                    <td className="p-3 font-medium">{r.full_name}</td>
                    <td className="p-3">{r.stream}</td>
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
                    <td className="p-3 font-bold">{r.total_score}/30</td>
                    <td className="p-3">{r.tokens_used ?? 0}/4</td>
                    <td className="p-3">{r.tab_switches ?? 0}</td>
                    <td className="p-3">
                      {r.attention_check_passed === true
                        ? 'Pass'
                        : r.attention_check_passed === false
                        ? 'Fail'
                        : '-'}
                    </td>
                    <td className="p-3">{r.engagement_avg}</td>
                    <td className="p-3">{r.fairness_avg}</td>
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
