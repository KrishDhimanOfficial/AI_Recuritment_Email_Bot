"use client";

import { useQuery } from "@tanstack/react-query";
import Container from "@/components/UI/Container";
import Section from "@/components/UI/Section";
import Card from "@/components/UI/Card";
import api from "@/config/axios.config";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

// ── Colors ──────────────────────────────────────────────────────────────
const CHART_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
const SCORE_COLORS = { "0-25": "#ef4444", "26-50": "#f59e0b", "51-75": "#06b6d4", "76-100": "#10b981" };
const FUNNEL_COLORS = ["#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];

const HEALTH_STYLES: Record<string, string> = {
  Excellent: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Good: "bg-sky-50 text-sky-700 ring-sky-600/20",
  Average: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Poor: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

// ── Stat Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, icon, accent, sub }: { label: string; value: string | number; icon: React.ReactNode; accent: string; sub?: string }) {
  return (
    <Card className={`border-t-4 ${accent}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider">{label}</p>
          <h3 className="text-3xl font-extrabold text-brand-900 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${accent.replace("border-t-", "bg-").replace("500", "50")} text-brand-600`}>
          {icon}
        </div>
      </div>
      {sub && <p className="mt-3 text-xs text-brand-500 font-medium">{sub}</p>}
    </Card>
  );
}

// ── SVG Icons (inline, lightweight) ─────────────────────────────────────
const Icons = {
  doc: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  mail: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
};

// ── Custom Tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-brand-200 shadow-lg rounded-lg px-3 py-2 text-xs">
      <p className="font-semibold text-brand-900 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════
export default function DashboardOverview() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      const res = await api.get("/api/dashboard/analytics", { withCredentials: true, withXSRFToken: true });
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Container as="main" className="flex-1 max-w-7xl py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-500 font-medium">Loading analytics…</p>
        </div>
      </Container>
    );
  }

  if (!data?.success) {
    return (
      <Container as="main" className="flex-1 max-w-7xl py-8">
        <p className="text-center text-brand-500">Failed to load dashboard data.</p>
      </Container>
    );
  }

  const { overview, candidateClassification, jobAnalytics, aiMatchAnalytics, technologyAnalytics, applicationTrend, hiringFunnel, performanceMetrics, healthIndicator, insights, charts } = data;

  return (
    <Container as="main" className="flex-1 max-w-7xl py-8">
      <Section className="animate-fade-in-up space-y-8">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">Dashboard Overview</h1>
            <p className="text-brand-500 mt-1 text-sm">Real-time recruitment analytics powered by AI.</p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ring-inset ${HEALTH_STYLES[healthIndicator?.recruitmentHealth] ??
                HEALTH_STYLES.Poor
                }`}
            >
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              {healthIndicator?.recruitmentHealth || "Unknown"}
            </span>

            {healthIndicator?.reason && (
              <p className="max-w-xs text-xs leading-5 text-brand-400">
                {healthIndicator.reason}
              </p>
            )}
          </div>
        </div>

        {/* ── Stat Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatCard label="Total Resumes" value={overview.totalApplications} icon={Icons.doc} accent="border-t-primary-500" sub={`↑ ${applicationTrend.weeklyGrowth >= 0 ? '+' : ''}${applicationTrend.weeklyGrowth}% from last week`} />
          <StatCard label="Emails Sent" value={overview.emailsSent} icon={Icons.mail} accent="border-t-teal-500" sub={`${performanceMetrics.emailSuccessRate}% Automation rate`} />
          <StatCard label="Pending Review" value={overview.pendingReview} icon={Icons.clock} accent="border-t-amber-500" sub="Awaiting manual action" />
          <StatCard label="Open Jobs" value={overview.activeJobs} icon={Icons.briefcase} accent="border-t-indigo-500" sub={`${overview.shortlisted} shortlisted candidates`} />
        </div>

        {/* ── Row 1: Candidate Types + Score Distribution ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Candidates by Type — Pie Chart */}
          <Card>
            <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Candidates by Type</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.candidatesByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} strokeWidth={2} stroke="#fff">
                      {charts.candidatesByType.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {candidateClassification.map((c: any, i: number) => (
                  <div key={c.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-brand-800 font-medium">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-900">{c.count}</span>
                      <span className="text-brand-400 text-xs w-12 text-right">{c.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Score Distribution — Bar Chart */}
          <Card>
            <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-1">AI Score Distribution</h3>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-xs text-brand-500">Avg: <strong className="text-brand-900">{aiMatchAnalytics.averageScore}</strong></span>
              <span className="text-xs text-brand-500">Median: <strong className="text-brand-900">{aiMatchAnalytics.medianScore}</strong></span>
              <span className="text-xs text-brand-500">Range: <strong className="text-brand-900">{aiMatchAnalytics.lowestScore}–{aiMatchAnalytics.highestScore}</strong></span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={charts.scoreDistribution} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Candidates" radius={[6, 6, 0, 0]}>
                  {charts.scoreDistribution.map((entry: any, i: number) => (
                    <Cell key={i} fill={SCORE_COLORS[entry.range as keyof typeof SCORE_COLORS] || CHART_COLORS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Row 2: Top Technologies + Application Trend ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Technologies — Horizontal Bar */}
          <Card>
            <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">Top Technologies</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={technologyAnalytics} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Candidates" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Applications Over Time — Line Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider">Applications Over Time</h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${applicationTrend.weeklyGrowth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {applicationTrend.weeklyGrowth >= 0 ? '↑' : '↓'} {Math.abs(applicationTrend.weeklyGrowth)}% this week
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={charts.applicationsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" name="Applications" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* ── Row 3: Hiring Funnel + Job Analytics Table ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Hiring Funnel */}
          <Card className="lg:col-span-2">
            <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-5">Hiring Funnel</h3>
            <div className="space-y-3">
              {hiringFunnel.map((stage: any, i: number) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-brand-800">{stage.stage}</span>
                    <span className="font-bold text-brand-900">{stage.count} <span className="text-brand-400 font-normal text-xs">({stage.conversion}%)</span></span>
                  </div>
                  <div className="w-full bg-brand-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${stage.conversion}%`, backgroundColor: FUNNEL_COLORS[i] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Job Analytics Table */}
          <Card noPadding className="lg:col-span-3 overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-100">
              <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider">Job-wise Analytics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-brand-50/50 text-brand-600">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider">Job Title</th>
                    <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider">Applicants</th>
                    <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider">Shortlisted</th>
                    <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider">Avg Score</th>
                    <th className="text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider">Hiring %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {jobAnalytics.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-brand-400 text-sm">No job data available.</td></tr>
                  ) : (
                    jobAnalytics.map((job: any) => (
                      <tr key={job.title} className="hover:bg-brand-50/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-brand-900">{job.title}</td>
                        <td className="text-center px-3 py-3 text-brand-700">{job.totalApplicants}</td>
                        <td className="text-center px-3 py-3">
                          <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{job.shortlisted}</span>
                        </td>
                        <td className="text-center px-3 py-3 font-bold text-brand-900">{job.averageScore}</td>
                        <td className="text-center px-3 py-3">
                          <span className={`text-xs font-bold ${job.hiringRate >= 50 ? 'text-emerald-600' : job.hiringRate >= 20 ? 'text-amber-600' : 'text-rose-600'}`}>{job.hiringRate}%</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* ── Row 4: Performance Metrics + AI Insights ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Performance Metrics */}
          <Card>
            <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-5">Performance Metrics</h3>
            <div className="space-y-4">
              {[
                { label: "Shortlisting Rate", value: performanceMetrics.shortlistingRate, color: "#6366f1" },
                { label: "Email Success Rate", value: performanceMetrics.emailSuccessRate, color: "#06b6d4" },
                { label: "Average AI Score", value: performanceMetrics.averageResumeMatch, color: "#10b981" },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-brand-700">{metric.label}</span>
                    <span className="font-extrabold text-brand-900">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-brand-100 rounded-full h-2.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(metric.value, 100)}%`, backgroundColor: metric.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Insights */}
          <Card>
            <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider mb-4">AI Insights</h3>
            <div className="space-y-3">
              {insights.map((insight: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-brand-50/50 rounded-xl border border-brand-100">
                  <span className="text-lg mt-0.5">💡</span>
                  <p className="text-sm text-brand-800 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </Section>
    </Container>
  );
}
