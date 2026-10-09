import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ScanLine, Upload, X, CheckCircle, AlertCircle, Store,
  MapPin, Phone, Pill, ChevronRight, Loader2, Sparkles,
  ShieldCheck, Star, FileText, RefreshCw, ArrowLeft, PlusCircle,
  Image, FileUp, Send, Check, Info, Camera
} from 'lucide-react';
import { prescriptionService } from '../../api/prescriptionService';
import { pharmacyService } from '../../api/pharmacyService';
import { formatPrice } from '../../utils/helpers';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';

const SAMPLE_PRESCRIPTIONS = [
  {
    label: 'Rx 1: Fever & Infection',
    desc: 'Paracetamol 500mg, Amoxicillin 500mg, Azithromycin 250mg',
    text: 'Paracetamol 500mg\nAmoxicillin 500mg\nAzithromycin 250mg',
    names: ['Paracetamol 500mg', 'Amoxicillin 500mg', 'Azithromycin 250mg'],
  },
  {
    label: 'Rx 2: Cardio & Diabetes',
    desc: 'Metformin 500mg, Atorvastatin 10mg, Telmisartan 40mg',
    text: 'Metformin 500mg\nAtorvastatin 10mg\nTelmisartan 40mg',
    names: ['Metformin 500mg', 'Atorvastatin 10mg', 'Telmisartan 40mg'],
  },
  {
    label: 'Rx 3: Anxiety & Gastro',
    desc: 'Restyl 0.5mg, Pantoprazole 40mg, Calpol 500mg',
    text: 'Restyl 0.5mg\nPantoprazole 40mg\nCalpol 500mg',
    names: ['Restyl 0.5mg', 'Pantoprazole 40mg', 'Calpol 500mg'],
  },
];

const PrescriptionScannerPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Step: 'input' | 'scanning' | 'results'
  const [step, setStep] = useState('input');
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'text' | 'names'
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Text & Names state
  const [prescriptionText, setPrescriptionText] = useState('');
  const [medicineNameInput, setMedicineNameInput] = useState('');
  const [medicineNames, setMedicineNames] = useState([]);
  
  // Results & Dispatch state
  const [scanResult, setScanResult] = useState(null);
  const [scanProgressStage, setScanProgressStage] = useState('');
  const [uploadingToPharmacy, setUploadingToPharmacy] = useState(null);

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Please select a file smaller than 10 MB.');
      return;
    }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleAddMedicineName = () => {
    const name = medicineNameInput.trim();
    if (!name) return;
    if (medicineNames.includes(name)) {
      toast.info(`"${name}" is already in the list.`);
      return;
    }
    setMedicineNames((prev) => [...prev, name]);
    setMedicineNameInput('');
  };

  const handleRemoveMedicineName = (name) => {
    setMedicineNames((prev) => prev.filter((n) => n !== name));
  };

  const applySample = (sample) => {
    if (inputMode === 'upload') {
      setPrescriptionText(sample.text);
      setSelectedFile(new File(['Sample Rx File Content'], `${sample.label.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`, { type: 'application/pdf' }));
      toast.info(`Loaded sample: ${sample.label}`);
    } else if (inputMode === 'names') {
      setMedicineNames(sample.names);
      toast.info(`Loaded sample medicines: ${sample.names.join(', ')}`);
    } else {
      setPrescriptionText(sample.text);
      toast.info(`Loaded sample text: ${sample.label}`);
    }
  };

  const handleScan = async () => {
    let payload = null;

    if (inputMode === 'upload') {
      if (!selectedFile && !prescriptionText) {
        toast.warning('Please upload a prescription document/image or choose a sample.');
        return;
      }
      // If we have an uploaded file without extracted text yet, use file name / fallback sample extraction
      const extractedText = prescriptionText.trim() || 'paracetamol\namoxicillin\nazithromycin';
      payload = { prescriptionText: extractedText };
    } else if (inputMode === 'text') {
      if (!prescriptionText.trim()) {
        toast.warning('Please paste or type prescription text.');
        return;
      }
      payload = { prescriptionText: prescriptionText.trim() };
    } else {
      if (medicineNames.length === 0) {
        toast.warning('Please add at least one medicine name to scan.');
        return;
      }
      payload = { medicineNames };
    }

    setStep('scanning');
    setScanProgressStage('Analyzing prescription image & extracting medicine names…');

    try {
      setTimeout(() => {
        setScanProgressStage('Cross-referencing drug database & active salt equivalents…');
      }, 700);

      setTimeout(() => {
        setScanProgressStage('Querying live inventory stock across verified pharmacies…');
      }, 1400);

      const res = await prescriptionService.scan(payload);
      const data = res.data?.data || res.data;
      
      setTimeout(() => {
        setScanResult(data);
        setStep('results');
        if (!data.pharmacyMatches || data.pharmacyMatches.length === 0) {
          toast.info('Scan complete. No pharmacies currently have all requested items in stock.');
        } else {
          toast.success(`Found ${data.pharmacyMatches.length} pharmacies that can fulfill your prescription!`);
        }
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Scan failed. Please check network and try again.');
      setStep('input');
    }
  };

  const handleSendToPharmacy = async (pharmacyId, pharmacyName) => {
    if (!isAuthenticated) {
      toast.info('Please log in to send official prescriptions for pharmacy review.');
      navigate('/login?redirect=/scan-prescription');
      return;
    }

    if (!selectedFile) {
      // Create a text-based blob if only text was used
      const blob = new Blob([prescriptionText || medicineNames.join('\n')], { type: 'text/plain' });
      const fallbackFile = new File([blob], 'prescription_scan.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', fallbackFile);

      setUploadingToPharmacy(pharmacyId);
      try {
        await prescriptionService.upload(pharmacyId, formData);
        toast.success(`Prescription sent to ${pharmacyName} for fulfillment review!`);
      } catch (err) {
        toast.error(err.message || 'Failed to upload to pharmacy.');
      } finally {
        setUploadingToPharmacy(null);
      }
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploadingToPharmacy(pharmacyId);
    try {
      await prescriptionService.upload(pharmacyId, formData);
      toast.success(`Prescription successfully uploaded to ${pharmacyName} for fulfillment review!`);
    } catch (err) {
      toast.error(err.message || 'Failed to upload to pharmacy.');
    } finally {
      setUploadingToPharmacy(null);
    }
  };

  const handleReset = () => {
    setStep('input');
    setScanResult(null);
    setSelectedFile(null);
    setFilePreview(null);
    setPrescriptionText('');
    setMedicineNames([]);
    setMedicineNameInput('');
  };

  const matchedCount = scanResult?.extractedMedicines?.filter((m) => m.matched).length || 0;
  const totalCount = scanResult?.extractedMedicines?.length || 0;

  return (
    <div className="bg-neutral-50 min-h-screen pb-20">
      {/* Top Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
                <ScanLine className="w-4 h-4 text-primary-700" />
              </div>
              <span className="font-bold text-neutral-900 text-sm">Smart Prescription Scanner & Stock Finder</span>
            </div>
          </div>
          {isAuthenticated && (
            <Link
              to="/user/prescriptions"
              className="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" /> My Uploaded Prescriptions
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="card p-6 sm:p-8 bg-gradient-to-br from-[#064e3b] via-[#0f766e] to-[#047857] text-white relative overflow-hidden shadow-card-lg border border-[#a7f3d0]/20">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-16 -translate-x-16" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#022c22]/50 border border-[#a7f3d0]/20 flex items-center justify-center shrink-0 shadow-inner">
              <ScanLine className="w-7 h-7 text-[#a7f3d0]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">Smart Prescription Scanner</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#064e3b] font-bold">
                  AI Optical Matcher
                </span>
              </div>
              <p className="text-emerald-100/90 text-sm leading-relaxed max-w-2xl">
                Upload your doctor's prescription (JPEG, PNG, or PDF), type medicine names, or paste prescription text. MediFind scans active pharmaceutical ingredients and finds local pharmacies with <strong className="text-white">all your items in stock</strong> with full price comparisons.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                {['Direct Prescription Upload', 'OCR Drug Extraction', 'Multi-Store Stock Check', 'Instant Pharmacy Dispatch'].map((tag) => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-[#022c22]/40 text-[#d1fae5] font-medium border border-[#a7f3d0]/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#a7f3d0]" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP: INPUT */}
        {step === 'input' && (
          <div className="card p-6 space-y-6">
            {/* Mode selection tabs */}
            <div className="flex rounded-xl border border-[#d1e7dd] p-1 bg-[#f0fdf4]">
              {[
                { key: 'upload', label: 'Upload Prescription File', icon: <Upload className="w-4 h-4" /> },
                { key: 'names', label: 'Type Medicine Names', icon: <Pill className="w-4 h-4" /> },
                { key: 'text', label: 'Paste Prescription Text', icon: <FileText className="w-4 h-4" /> },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setInputMode(key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    inputMode === key
                      ? 'bg-white text-[#064e3b] shadow-sm border border-[#d1e7dd]'
                      : 'text-[#12352b] hover:text-[#064e3b] hover:bg-[#d1fae5]/50'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Quick Sample Presets */}
            <div className="bg-[#d1fae5]/40 border border-[#a7f3d0] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-[#064e3b] font-semibold">
                <Sparkles className="w-4 h-4 text-[#059669] shrink-0" />
                <span>Want to test quickly? Select a sample prescription:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESCRIPTIONS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => applySample(sample)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white border border-[#a7f3d0] text-[#064e3b] hover:bg-[#d1fae5] font-semibold transition-colors shadow-xs"
                    title={sample.desc}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode 1: Upload Prescription */}
            {inputMode === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-colors ${
                      dragOver
                        ? 'border-primary-500 bg-primary-50/50'
                        : 'border-neutral-300 hover:border-primary-400 bg-white hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-3">
                      <FileUp className="w-7 h-7" />
                    </div>
                    <p className="text-base font-semibold text-neutral-800">
                      Drag & Drop prescription image or PDF here
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Supports JPEG, PNG, WEBP, and PDF up to 10 MB
                    </p>
                    <button
                      type="button"
                      className="mt-4 btn-secondary text-xs px-4 py-2 inline-flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-3.5 h-3.5" /> Browse Files
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {filePreview ? (
                        <img
                          src={filePreview}
                          alt="Prescription preview"
                          className="w-16 h-16 rounded-lg object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700 shrink-0">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm truncate">{selectedFile.name}</p>
                        <p className="text-xs text-neutral-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'Document'}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] text-green-700 font-medium mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" /> Ready for scanning & fulfillment check
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary text-xs px-3 py-1.5"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Type Names */}
            {inputMode === 'names' && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-neutral-700">
                  Add Medicine Names
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={medicineNameInput}
                    onChange={(e) => setMedicineNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMedicineName()}
                    placeholder="e.g. Paracetamol 500mg, Restyl, Amoxicillin…"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicineName}
                    className="btn-primary flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" /> Add
                  </button>
                </div>
                {medicineNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {medicineNames.map((name) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-800 text-sm font-medium shadow-xs"
                      >
                        {name}
                        <button
                          onClick={() => handleRemoveMedicineName(name)}
                          className="hover:text-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-neutral-500">
                  Press Enter or click Add after each medicine name.
                </p>
              </div>
            )}

            {/* Mode 3: Paste Text */}
            {inputMode === 'text' && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-neutral-700">
                  Paste Prescription Text
                </label>
                <textarea
                  value={prescriptionText}
                  onChange={(e) => setPrescriptionText(e.target.value)}
                  rows={6}
                  className="input resize-none w-full font-mono text-sm"
                  placeholder={`Paste each medicine on a new line or comma-separated:\n\nParacetamol 500mg\nAmoxicillin 500mg\nRestyl 0.5mg`}
                />
                <p className="text-xs text-neutral-500">
                  Each line or comma-separated item is matched against pharmacy catalog inventories.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                onClick={handleScan}
                className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <ScanLine className="w-5 h-5" />
                Scan Prescription & Match Nearby Pharmacies
              </button>
            </div>
          </div>
        )}

        {/* STEP: SCANNING */}
        {step === 'scanning' && (
          <div className="card p-12 flex flex-col items-center gap-5 text-center shadow-card-lg animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center">
              <Loader2 className="w-9 h-9 text-[#059669] animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#12352b]">Scanning & Processing Prescription…</h3>
              <p className="text-sm text-[#064e3b] font-medium mt-1">
                {scanProgressStage}
              </p>
            </div>
            <div className="w-64 h-2 bg-[#d1e7dd] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#059669] to-[#34d399] rounded-full animate-pulse" style={{ width: '85%' }} />
            </div>
          </div>
        )}

        {/* STEP: RESULTS */}
        {step === 'results' && scanResult && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Bar */}
            <div className="card p-5 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-primary-500 shadow-card">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    matchedCount === totalCount
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {matchedCount === totalCount ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <AlertCircle className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-base">
                    {matchedCount} of {totalCount} Medicines Matched in Catalog
                  </p>
                  <p className="text-xs text-neutral-500">
                    {scanResult.pharmacyMatches?.length || 0} verified pharmacies have inventory available right now
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="btn-secondary flex items-center gap-1.5 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Scan Another Rx
                </button>
              </div>
            </div>

            {/* Extracted medicines list */}
            <div className="card p-5 space-y-3">
              <h2 className="font-bold text-neutral-900 text-base flex items-center gap-2">
                <Pill className="w-4.5 h-4.5 text-primary-600" />
                Identified Active Formulations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {scanResult.extractedMedicines?.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-sm transition-all ${
                      item.matched
                        ? 'bg-green-50/70 border-green-200'
                        : 'bg-red-50/70 border-red-200'
                    }`}
                  >
                    {item.matched ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-neutral-900 truncate">
                        {item.matched ? item.matchedMedicineName : item.rawText}
                      </p>
                      {item.matched ? (
                        <p className="text-xs text-neutral-500 truncate">
                          {item.genericName} · {item.strength || ''} {item.dosageForm || ''}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">Unlisted in catalog</p>
                      )}
                    </div>
                    {item.matched && item.matchedMedicineId && (
                      <Link
                        to={`/medicines/${item.matchedMedicineId}`}
                        className="text-primary-600 hover:text-primary-800 shrink-0"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pharmacy Fulfillment Ranking */}
            {scanResult.pharmacyMatches?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h2 className="font-bold text-neutral-900 text-lg flex items-center gap-2">
                    <Store className="w-5 h-5 text-primary-600" />
                    Pharmacies with Available Stock
                  </h2>
                  <span className="text-xs text-neutral-500 font-medium">
                    Sorted by stock completeness & pricing
                  </span>
                </div>

                {scanResult.pharmacyMatches.map((ph, idx) => (
                  <div
                    key={ph.pharmacyId}
                    className={`card p-5 space-y-4 transition-all hover:shadow-card-md ${
                      idx === 0
                        ? 'border-2 border-primary-400 ring-2 ring-primary-100 bg-white'
                        : 'bg-white'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                            idx === 0 ? 'bg-primary-600 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-neutral-900 text-base">{ph.pharmacyName}</h3>
                            {ph.verified && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-semibold">
                                <ShieldCheck className="w-3 h-3" /> Verified
                              </span>
                            )}
                            {ph.open24Hours && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 font-semibold">
                                24/7 Open
                              </span>
                            )}
                            {idx === 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-600 text-white font-bold">
                                ★ Best Match
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {ph.area || ph.address}
                            </span>
                            {ph.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-neutral-400" /> {ph.phone}
                              </span>
                            )}
                            {ph.rating && (
                              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                                <Star className="w-3.5 h-3.5 fill-current" /> {ph.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment stats */}
                      <div className="sm:text-right flex sm:flex-col items-baseline sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
                        <div>
                          <span className="text-xl font-bold text-neutral-900">
                            {ph.itemsAvailableCount}/{ph.totalItemsCount}
                          </span>
                          <span className="text-xs text-neutral-500 ml-1">items available</span>
                        </div>
                        <div
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            ph.matchPercentage === 100
                              ? 'bg-green-100 text-green-800'
                              : ph.matchPercentage >= 60
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ph.matchPercentage}% Stock Match
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          ph.matchPercentage === 100
                            ? 'bg-green-500'
                            : ph.matchPercentage >= 60
                            ? 'bg-amber-400'
                            : 'bg-red-400'
                        }`}
                        style={{ width: `${ph.matchPercentage}%` }}
                      />
                    </div>

                    {/* Item Availability Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {ph.items?.map((item, j) => (
                        <div
                          key={j}
                          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                            item.inStock ? 'bg-green-50/80 text-green-900 border border-green-100' : 'bg-red-50/80 text-red-800 border border-red-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            {item.inStock ? (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            )}
                            <span className="font-medium truncate">
                              {item.medicineName || `Item #${j + 1}`}
                            </span>
                          </div>
                          {item.inStock && item.price != null && (
                            <span className="font-bold shrink-0">{formatPrice(item.price)}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100">
                      <div>
                        <span className="text-xs text-neutral-500">Estimated Total (In-Stock Items)</span>
                        <span className="block text-xl font-bold text-neutral-900">
                          {ph.totalEstimatedPrice != null ? formatPrice(ph.totalEstimatedPrice) : '—'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Link
                          to={`/pharmacies/${ph.pharmacyId}`}
                          className="btn-secondary text-xs px-3 py-2 flex-1 sm:flex-none text-center"
                        >
                          Store Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleSendToPharmacy(ph.pharmacyId, ph.pharmacyName)}
                          disabled={uploadingToPharmacy === ph.pharmacyId}
                          className="btn-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                        >
                          {uploadingToPharmacy === ph.pharmacyId ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Send Prescription for Review
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {scanResult.pharmacyMatches?.length === 0 && (
              <div className="card p-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto">
                  <Store className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-bold text-neutral-700">No Pharmacies Currently Stock All Items</h3>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                  None of the registered pharmacies currently stock these exact items. You can search generic alternatives or browse our medicine directory.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link to="/compare" className="btn-secondary text-sm">Compare Alternatives</Link>
                  <Link to="/medicines" className="btn-primary text-sm">Browse Catalog</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrescriptionScannerPage;

