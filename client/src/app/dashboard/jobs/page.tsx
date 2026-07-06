"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Container from "@/components/UI/Container";
import Section from "@/components/UI/Section";
import Card, { CardContent } from "@/components/UI/Card";
import Badge from "@/components/UI/Badge";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import api from "@/config/axios.config";
import { toast } from "sonner";

interface Pagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

const DEFAULT_PAGINATION: Pagination = {
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  limit: 10,
};

const EMPTY_JOB = {
  id: "",
  title: "",
  technology: "",
  experienceRequired: "",
  openings: "",
  internship: false,
  active: true,
};

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState(EMPTY_JOB);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: responseData, isLoading } = useQuery({
    queryKey: ["jobs", currentPage, limit],
    queryFn: async () => {
      const res = await api.get(
        `/api/get/all/jobs/requirment?page=${currentPage}&limit=${limit}`,
        {
          withCredentials: true,
          withXSRFToken: true,
        },
      );
      return res.data;
    },
  });

  const jobs = responseData?.data ?? [];
  const pagination = responseData?.pagination ?? DEFAULT_PAGINATION;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
  };

  const resetForm = () => setNewJob(EMPTY_JOB);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const createJobMutation = useMutation({
    mutationFn: async (jobData: typeof EMPTY_JOB) => {
      const res = await api.post("/api/create/job/requirments", jobData, {
        withCredentials: true,
        withXSRFToken: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Job created successfully");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save job");
    },
  });

  const editJobMutation = useMutation({
    mutationFn: async (jobData: typeof EMPTY_JOB) => {
      const res = await api.put(
        `/api/edit/job/requirment?id=${jobData.id}`,
        jobData,
        {
          withCredentials: true,
          withXSRFToken: true,
        },
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Job updated successfully");
      setIsModalOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to edit job");
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/api/delete/job/requirment?id=${id}`, {
        withCredentials: true,
        withXSRFToken: true,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Job deleted successfully");
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete job");
    },
  });

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.technology) {
      toast.error("Please fill in required fields");
      return;
    }
    createJobMutation.mutate(newJob);
  };

  const handleEditJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.technology) {
      toast.error("Please fill in required fields");
      return;
    }
    editJobMutation.mutate(newJob);
  };

  const handleDeleteClick = (id: string) => {
    setJobToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // ── Get single ─────────────────────────────────────────────────────────────
  const getSingleJob = async (id: string) => {
    try {
      const res = await api.get(`/api/get/job/requirment?id=${id}`, {
        withCredentials: true,
        withXSRFToken: true,
      });
      if (res.status === 200) {
        setNewJob(res.data?.data);
        setIsModalOpen(true);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to fetch job details",
      );
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <Container as="main" className="flex-1 max-w-7xl py-8">
      <Section className="animate-fade-in-up">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-900">
              Job Requirements
            </h1>

            <p className="mt-2 max-w-2xl text-sm md:text-base text-brand-500">
              Manage active positions for the AI to match candidates against.
            </p>
          </div>

          <Button
            variant="primary"
            className="w-full md:w-auto px-6 py-2.5"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            + Add New Job
          </Button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job: any) => (
            <Card key={job.id} className="relative group">
              <CardContent>
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={job.active === 1 ? "success" : "default"}>
                    {job.active === 1 ? "Active" : "Closed"}
                  </Badge>
                  <span className="text-sm font-medium text-brand-400 bg-brand-50 px-2 py-1 rounded-md">
                    {job.applicants ?? 0} Applicants
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-900 mb-2">
                  {job.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-sm text-brand-500 mb-4">
                  <span className="bg-brand-50 px-2 py-0.5 rounded">
                    {job.technology}
                  </span>
                  <span>•</span>
                  <span>
                    {job.experienceRequired}{" "}
                    {Number(job.experienceRequired) === 1 ? "Year" : "Years"}
                  </span>
                  {job.internship === 1 && (
                    <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded text-xs font-medium">
                      Internship
                    </span>
                  )}
                  <span>
                    • {job.openings}{" "}
                    {Number(job.openings) === 1 ? "Opening" : "Openings"}
                  </span>
                </div>

                <div className="pt-4 border-t border-brand-100 flex gap-2">
                  <Button
                    size="sm"
                    variant="white"
                    className="flex-1"
                    onClick={() => getSingleJob(job.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="flex-1 bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                    onClick={() => handleDeleteClick(job.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {jobs.length === 0 && (
            <div className="col-span-full text-center py-16 text-brand-400">
              <p className="text-lg font-medium">No job requirements yet.</p>
              <p className="text-sm mt-1">
                Click &quot;+ Add New Job&quot; to create one.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-2">
            <Button
              variant="white"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              ← Prev
            </Button>

            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === pagination.currentPage ? "bg-primary-600 text-white shadow" : "bg-white border border-brand-200 text-brand-600 hover:bg-brand-50"}`}
                >
                  {page}
                </button>
              ),
            )}

            <Button
              variant="white"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Next →
            </Button>
          </div>
        )}

        {pagination.totalItems > 0 && (
          <p className="text-center text-sm text-brand-400 mt-3">
            Showing page {pagination.currentPage} of {pagination.totalPages} (
            {pagination.totalItems} total jobs)
          </p>
        )}
      </Section>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={
          newJob.id ? "Edit Job Requirement" : "Create New Job Requirement"
        }
        maxWidth="max-w-lg"
      >
        <form
          onSubmit={newJob.id ? handleEditJob : handleAddJob}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-brand-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-white border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="e.g. Frontend Developer"
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-700 mb-1">
              Technology
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 bg-white border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              placeholder="e.g. React, Node.js"
              value={newJob.technology}
              onChange={(e) =>
                setNewJob({ ...newJob, technology: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1">
                Openings
              </label>
              <input
                type="number"
                min="0"
                required
                className="w-full px-4 py-2 bg-white border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="e.g. 5"
                value={newJob.openings}
                onChange={(e) =>
                  setNewJob({ ...newJob, openings: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-700 mb-1">
                Experience (Years)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                required
                className="w-full px-4 py-2 bg-white border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="e.g. 2.5"
                value={newJob.experienceRequired}
                onChange={(e) =>
                  setNewJob({ ...newJob, experienceRequired: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary-600"
                checked={newJob.internship}
                onChange={(e) =>
                  setNewJob({ ...newJob, internship: e.target.checked })
                }
              />
              <span className="text-sm font-semibold text-brand-700">
                Internship Role
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary-600"
                checked={newJob.active}
                onChange={(e) =>
                  setNewJob({ ...newJob, active: e.target.checked })
                }
              />
              <span className="text-sm font-semibold text-brand-700">
                Active Listing
              </span>
            </label>
          </div>

          <div className="pt-4 mt-2 border-t border-brand-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="white"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {newJob.id ? "Update Job" : "Create Job"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setJobToDelete(null);
        }}
        title="Delete Job Requirement"
        maxWidth="max-w-md"
        footer={
          <>
            <Button
              variant="white"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setJobToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={() => {
                if (jobToDelete) {
                  deleteJobMutation.mutate(jobToDelete);
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-brand-600">
          Are you sure you want to delete this job requirement? This action cannot be undone.
        </p>
      </Modal>
    </Container>
  );
}
