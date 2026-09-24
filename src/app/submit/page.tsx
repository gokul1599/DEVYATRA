"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Container } from "@/components/ui";

const TRADITIONS = [
  "Shaivism (Shiva)",
  "Vaishnavism (Vishnu)",
  "Shaktism (Devi / Amman)",
  "Smartism",
  "Kaumaram (Murugan)",
  "Ganapatya (Ganesha)",
  "Jainism",
  "Buddhism",
  "Sikhism",
  "Other Sacred Lineage",
];

export default function SubmitTemplePage() {
  const [templeName, setTempleName] = useState("");
  const [templeNameLocal, setTempleNameLocal] = useState("");
  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [localityName, setLocalityName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mainDeity, setMainDeity] = useState("");
  const [tradition, setTradition] = useState(TRADITIONS[0]);
  const [description, setDescription] = useState("");
  const [sourceProof, setSourceProof] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");
    setDuplicateWarning(null);

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setStatus("error");
      setErrorMessage("Please enter valid decimal coordinates (e.g. 13.0827, 80.2707).");
      return;
    }

    try {
      const res = await fetch("/api/v1/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templeName,
          templeNameLocal: templeNameLocal || undefined,
          stateName,
          districtName,
          localityName: localityName || undefined,
          latitude: latNum,
          longitude: lngNum,
          mainDeity: `${mainDeity} (${tradition})`,
          description,
          sourceProof,
          contributorName,
          contributorEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Submission failed");
      }

      setSubmissionId(data.submissionId || "REC-" + Date.now().toString(36).toUpperCase());
      if (data.duplicateNotices && data.duplicateNotices.length > 0) {
        setDuplicateWarning(
          `Notice: A nearby shrine named "${data.duplicateNotices[0].existingName}" already exists. Our archivists will review for distinction.`
        );
      }
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Failed to record submission. Please verify your fields.");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0A0806] pt-24 pb-28">
      <Container className="max-w-3xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-[#C8A24B] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Atlas Home</span>
          </Link>
        </div>

        {/* Section Header */}
        <div className="space-y-3 border-b border-stone-800/80 pb-6 mb-8">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-[#C8A24B]">
            Community Contribution &amp; Heritage Ingestion
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F2ECE1]">
            Submit a Sacred Sanctuary
          </h1>
          <p className="font-sans text-xs sm:text-sm text-stone-300 leading-relaxed">
            Do you know of an unlisted ancient temple, cave shrine, or living village sanctum?
            Submit its verifiable coordinates and documentation to the Templeora archival pipeline.
          </p>
        </div>

        {status === "success" ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center space-y-4 shadow-2xl">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
            <h2 className="font-serif text-2xl font-normal text-[#F2ECE1]">
              Submission Received for Verification
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
              Thank you for contributing to India’s Sacred Atlas. Your submission has entered our editorial queue.
              We will cross-reference the coordinates with Survey of India data and official endowment gazetteers.
            </p>

            <div className="inline-block rounded-xl border border-stone-800 bg-stone-900/80 px-4 py-2 font-mono text-xs text-[#E4BE72]">
              Tracking Identifier: <strong>{submissionId}</strong>
            </div>

            {duplicateWarning && (
              <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs font-mono text-amber-300 text-left">
                {duplicateWarning}
              </div>
            )}

            <div className="pt-6">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-[#0A0806] font-semibold hover:bg-[#E4BE72] transition-colors"
              >
                <span>Explore Current Atlas</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {status === "error" && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-xs font-mono text-red-300 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Temple Identifiers */}
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-serif text-lg font-medium text-[#F2ECE1] border-b border-stone-800/80 pb-3">
                1. Sanctuary Identity
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Canonical Temple Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={templeName}
                    onChange={(e) => setTempleName(e.target.value)}
                    placeholder="e.g. Sri Ranganathaswamy Temple"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Native / Regional Script Name
                  </label>
                  <input
                    type="text"
                    value={templeNameLocal}
                    onChange={(e) => setTempleNameLocal(e.target.value)}
                    placeholder="e.g. ஸ்ரீ ரங்கநாதசுவாமி கோவில்"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Presiding Deity *
                  </label>
                  <input
                    type="text"
                    required
                    value={mainDeity}
                    onChange={(e) => setMainDeity(e.target.value)}
                    placeholder="e.g. Lord Ranganatha (Maha Vishnu)"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Tradition / Agama Lineage
                  </label>
                  <select
                    value={tradition}
                    onChange={(e) => setTradition(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 text-xs font-sans text-stone-100 focus:border-[#C8A24B] focus:outline-none"
                  >
                    {TRADITIONS.map((t) => (
                      <option key={t} value={t} className="bg-stone-950 text-stone-200">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Geographic Fix */}
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-serif text-lg font-medium text-[#F2ECE1] border-b border-stone-800/80 pb-3">
                2. Geographic Location &amp; Coordinates
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    State / UT *
                  </label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    placeholder="e.g. Tiruchirappalli"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Town / Locality
                  </label>
                  <input
                    type="text"
                    value={localityName}
                    onChange={(e) => setLocalityName(e.target.value)}
                    placeholder="e.g. Srirangam"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Rooftop Latitude (Decimal) *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 10.8624"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Rooftop Longitude (Decimal) *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 78.6908"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Cultural Context & Source Proof */}
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-serif text-lg font-medium text-[#F2ECE1] border-b border-stone-800/80 pb-3">
                3. Historical Documentation &amp; Verification Evidence
              </h3>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  Historical Summary &amp; Architecture Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the presiding deity, historical era, dynasty of construction, and architectural style..."
                  className="w-full rounded-xl border border-stone-800 bg-stone-900/80 p-3 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-stone-400 mb-1">
                  Official Source Reference / Trust Website / Gazetteer Link *
                </label>
                <input
                  type="text"
                  required
                  value={sourceProof}
                  onChange={(e) => setSourceProof(e.target.value)}
                  placeholder="e.g. Official Devasthanam URL, ASI survey citation, or district gazetteer"
                  className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                />
              </div>
            </div>

            {/* Contributor Info */}
            <div className="rounded-3xl border border-stone-800/80 bg-stone-950/80 p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="font-serif text-lg font-medium text-[#F2ECE1] border-b border-stone-800/80 pb-3">
                4. Contributor Contact (For Editorial Attribution)
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={contributorName}
                    onChange={(e) => setContributorName(e.target.value)}
                    placeholder="e.g. R. Venkatraman"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-stone-400 mb-1">
                    Your Email (Kept Strictly Private)
                  </label>
                  <input
                    type="email"
                    value={contributorEmail}
                    onChange={(e) => setContributorEmail(e.target.value)}
                    placeholder="e.g. venkat@example.com"
                    className="w-full rounded-xl border border-stone-800 bg-stone-900/80 px-3.5 py-2 text-xs font-sans text-stone-100 placeholder:text-stone-600 focus:border-[#C8A24B] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] font-mono text-stone-500">
                All submissions enter review before publication. No automated verification.
              </p>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center gap-2 rounded-full bg-[#C8A24B] px-8 py-3.5 font-mono text-xs uppercase tracking-wider text-[#0A0806] font-semibold hover:bg-[#E4BE72] transition-colors disabled:opacity-60 shadow-xl"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{status === "submitting" ? "Transmitting..." : "Submit to Verification Pipeline"}</span>
              </button>
            </div>
          </form>
        )}
      </Container>
    </main>
  );
}
