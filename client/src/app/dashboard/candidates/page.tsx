"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Container from "@/components/UI/Container";
import Section from "@/components/UI/Section";
import Card from "@/components/UI/Card";
import Badge from "@/components/UI/Badge";
import Table, { TableCell, TableHead, TableHeader, TableRow } from "@/components/UI/Table";
import Modal from "@/components/UI/Modal";
import Button from "@/components/UI/Button";
import api from "@/config/axios.config";
import { toast } from "sonner";
import config from "@/config/config";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-700 bg-emerald-50 ring-emerald-600/20";
  if (score >= 50) return "text-amber-700 bg-amber-50 ring-amber-600/20";
  return "text-rose-700 bg-rose-50 ring-rose-600/20";
};

export default function CandidatesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [editedDraft, setEditedDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [filterTechnology, setFilterTechnology] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["candidates", page, limit, filterTechnology, filterType, filterStatus, filterFromDate, filterToDate],
    queryFn: async () => {
      const res = await api.get(
        `/api/candidate/candiates?page=${page}&limit=${limit}&technology=${encodeURIComponent(filterTechnology)}&type=${encodeURIComponent(filterType)}&status=${encodeURIComponent(filterStatus)}&fromDate=${encodeURIComponent(filterFromDate)}&toDate=${encodeURIComponent(filterToDate)}`,
        {
          withCredentials: true,
          withXSRFToken: true,
        },
      );
      return res.data;
    },
  });

  const candidates = responseData?.data ?? [];
  const pagination = {
    total: responseData?.total ?? 0,
    page: responseData?.page ?? 1,
    limit: responseData?.limit ?? 10,
    totalPages: responseData?.totalPages ?? 0,
  };

  const openDraftModal = (candidate: any) => {
    setSelectedCandidate(candidate);
    // Use aiReason as draft if available; we assume backend aiReason holds draft content or analysis. 
    setEditedDraft(candidate.aiReason || "");
  };

  const handleApproveAndSend = async () => {
    if (!selectedCandidate) return;

    setIsSending(true);
    // Simulate API Call for sending email
    try {
      const res = await api.patch(`/gmail/send/specific/email?id=${selectedCandidate.id}`, {
      }, {
        withCredentials: true,
        withXSRFToken: true,
      })
      if (res.status === 200) {
        toast.success(res.data.message);
        setIsSending(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message)
      console.error(error);
    } finally {
      setIsSending(false)
    }
  };

  const getStatusBadge = (isEmailSent: boolean) => {
    if (isEmailSent) {
      return <Badge variant="success">Sent</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  };

  const handleResumeClick = (messageId: string) => {
    const url = `${config.server_origin}/gmail/resume/${messageId}`
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <Container as="main" className="flex-1 max-w-7xl py-8">
      <Section className="animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-950 tracking-tight">Candidate Intelligence</h1>
            <p className="text-brand-500 mt-2 text-sm max-w-2xl">
              Review AI-parsed applications, match scores, and automated email drafts before they are sent to applicants.
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">Technology</label>
              <input
                type="text"
                placeholder="e.g. React, Node.js"
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                value={filterTechnology}
                onChange={(e) => { setFilterTechnology(e.target.value); setPage(1); }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">Type</label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              >
                <option value="">All Types</option>
                <option value="fresher">Fresher</option>
                <option value="experienced">Experienced</option>
                <option value="intern">Intern</option>
                <option value="trainie">Trainee</option>
                <option value="junior">Junior</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">Status</label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Status</option>
                <option value="true">Sent</option>
                <option value="false">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">From Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
                value={filterFromDate}
                max={filterToDate || undefined}
                onChange={(e) => { setFilterFromDate(e.target.value); setPage(1); }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-600 mb-1 uppercase tracking-wide">To Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors bg-white"
                value={filterToDate}
                min={filterFromDate || undefined}
                onChange={(e) => { setFilterToDate(e.target.value); setPage(1); }}
              />
            </div>
          </div>
          {(filterTechnology || filterType || filterStatus || filterFromDate || filterToDate) && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-500">Active filters:</span>
              {filterTechnology && <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full">Tech: {filterTechnology}</span>}
              {filterType && <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full">Type: {filterType}</span>}
              {filterStatus && <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full">Status: {filterStatus === 'true' ? 'Sent' : 'Pending'}</span>}
              {filterFromDate && <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full">From: {filterFromDate}</span>}
              {filterToDate && <span className="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full">To: {filterToDate}</span>}
              <button
                onClick={() => { setFilterTechnology(""); setFilterType(""); setFilterStatus(""); setFilterFromDate(""); setFilterToDate(""); setPage(1); }}
                className="ml-auto text-xs text-brand-500 hover:text-rose-600 underline transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        <Card noPadding className="overflow-hidden shadow-sm border-brand-200/60">
          <Table>
            <TableHead className="bg-brand-50/50">
              <tr>
                <TableHeader>Candidate Profile</TableHeader>
                <TableHeader>Position Details</TableHeader>
                <TableHeader>AI Assessment</TableHeader>
                <TableHeader>Tech Stack</TableHeader>
                <TableHeader>Email Status</TableHeader>
                <TableHeader>Action</TableHeader>
              </tr>
            </TableHead>
            <tbody className="divide-y divide-brand-100">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-brand-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium">Analyzing candidates...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-brand-500">
                    <p className="text-sm font-medium">No candidates found in the system yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((candidate: any) => (
                  <TableRow key={candidate.id} className="hover:bg-brand-50/30 transition-colors">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-brand-900">{candidate.name}</span>
                        <span className="text-xs text-brand-500 mt-0.5">{candidate.email}</span>
                        <span className="text-xs text-brand-400 mt-1">{formatDate(candidate.appliedDate || candidate.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium text-brand-800 text-sm">
                          {candidate.appliedJob || "Open Application"}
                        </span>
                        <div className="flex gap-1.5 items-center mt-0.5">
                          <span className="text-xs text-brand-500 font-medium">
                            {candidate.experience ?? 0} YOE
                          </span>
                          {candidate.intership && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                              Intern
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ring-1 ring-inset ${getScoreColor(candidate.score ?? 0)}`}>
                          {candidate.score ?? 0}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-brand-500 uppercase tracking-wide">Category</span>
                          <span className="text-sm font-semibold capitalize text-brand-900">{candidate.type || "Unknown"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {candidate.technology ? candidate.technology.split(',').slice(0, 3).map((tech: string, i: number) => (
                          <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-md bg-brand-100 text-brand-700">
                            {tech.trim()}
                          </span>
                        )) : (
                          <span className="text-xs text-brand-400">Not specified</span>
                        )}
                        {candidate.technology && candidate.technology.split(',').length > 3 && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-brand-50 text-brand-500">
                            +{candidate.technology.split(',').length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(candidate.isEmailSent)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {!candidate.isEmailSent ? (
                          <Button size="sm" variant="primary" className="shadow-sm" onClick={() => openDraftModal(candidate)}>
                            Review
                          </Button>
                        ) : (
                          <Button size="sm" variant="white" onClick={() => openDraftModal(candidate)}>
                            View Details
                          </Button>
                        )}
                        <Button size="sm" variant="white" onClick={() => handleResumeClick(candidate.messageId)}>
                          Download Resume
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </tbody>
          </Table>

          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 bg-brand-50/50 border-t border-brand-100">
              <span className="text-sm text-brand-500 font-medium">
                Showing page {page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Section>

      {/* Manual Override & Details Modal */}
      <Modal
        isOpen={!!selectedCandidate}
        onClose={() => !isSending && setSelectedCandidate(null)}
        title={!selectedCandidate?.isEmailSent ? "AI Analysis & Email Review" : "Candidate Intelligence Report"}
        maxWidth="max-w-5xl"
        footer={
          <>
            {
              !selectedCandidate?.isEmailSent ? (
                <div className="flex w-full justify-between items-center">
                  <span className="text-sm text-brand-500">Review the AI assessment before sending the email.</span>
                  <div className="flex gap-3">
                    <Button variant="white" onClick={() => setSelectedCandidate(null)} disabled={isSending}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={handleApproveAndSend} disabled={isSending}>
                      {isSending ? "Sending Email..." : "Approve & Send Email"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="primary" onClick={() => setSelectedCandidate(null)}>
                  Close Report
                </Button>
              )
            }
            <Button variant="primary" onClick={() => handleResumeClick(selectedCandidate.messageId)}>
              Download Resume
            </Button>
          </>
        }
      >
        {selectedCandidate && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left Column: AI Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Score Card */}
              <div className="bg-white border border-brand-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-4">AI Match Score</h3>
                <div className="flex items-center gap-5">
                  <div className={`flex items-center justify-center w-20 h-20 rounded-full font-black text-3xl ring-4 ring-inset ${getScoreColor(selectedCandidate.score ?? 0)}`}>
                    {selectedCandidate.score ?? 0}
                  </div>
                  <div>
                    <p className="font-bold text-brand-900 text-lg capitalize">{selectedCandidate.type || "Unknown Category"}</p>
                    <p className="text-sm text-brand-500 mt-1">{selectedCandidate.experience ?? 0} Years Experience</p>
                    {selectedCandidate.intership && (
                      <Badge variant="info" className="mt-2">Internship Candidate</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="bg-brand-50 rounded-xl p-5 border border-brand-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-3">Role Alignment</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-brand-400 block mb-0.5">Applied For</span>
                    <span className="font-semibold text-brand-900">{selectedCandidate.appliedJob || "Open Application"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-brand-400 block mb-0.5">AI Matched To</span>
                    <span className="font-semibold text-brand-900">{selectedCandidate.matchedJob || "No specific match"}</span>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-3">Detected Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.technology ? selectedCandidate.technology.split(',').map((tech: string, i: number) => (
                    <span key={i} className="text-sm font-medium px-3 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-100">
                      {tech.trim()}
                    </span>
                  )) : (
                    <span className="text-sm text-brand-400 italic">No technologies detected</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Email Draft & Reason */}
            <div className="lg:col-span-3">
              <div className="bg-white border border-brand-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">

                {/* Candidate Header */}
                <div className="px-6 py-5 border-b border-brand-100 bg-gradient-to-r from-brand-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-bold shadow-sm">
                      {selectedCandidate.name?.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-brand-900 truncate">
                        {selectedCandidate.name}
                      </h2>

                      <p className="text-sm text-brand-600 truncate">
                        {selectedCandidate.email}
                      </p>
                    </div>

                    <div className="rounded-full bg-brand-100 text-brand-700 text-xs font-medium px-3 py-1">
                      Candidate
                    </div>
                  </div>
                </div>

                {/* AI Analysis Header */}
                <div className="px-6 py-4 border-b border-brand-100 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>

                    <div>
                      <h3 className="text-base font-semibold text-brand-900">
                        AI Recruitment Analysis
                      </h3>

                      <p className="text-sm text-brand-500">
                        Generated using AI based on the candidate's resume and application.
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Description */}
                <div className="flex-1 overflow-y-auto bg-white">
                  <div className="p-6">
                    <div className="rounded-xl border border-brand-100 bg-brand-50/30 p-5">
                      <p className="text-sm leading-7 text-brand-800 whitespace-pre-wrap break-words">
                        {editedDraft}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </Modal>
    </Container>
  );
}