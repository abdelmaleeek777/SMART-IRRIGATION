import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  MapPin,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StepIndicator from '../components/StepIndicator';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import { apiRequest } from '../services/api';
const ParcelMap = lazy(() => import('../components/ParcelMap'));

const initialFormData = {
  prenom: '',
  nom: '',
  email: '',
  password: '',
  confirmPassword: '',
  exploitationNom: '',
  localisation: '',
  parcelleNom: '',
  typeSol: '',
  typeCulture: '',
  superficie: '',
  latitude: '',
  longitude: '',
  polygon: null,
};

const soilOptions = ['Sandy', 'Clay', 'Loamy', 'Silty', 'Sandy Loam', 'Clay Loam'];
const cropOptions = ['Tomato', 'Wheat', 'Corn', 'Potato', 'Olive', 'Citrus', 'Other'];
const otpLength = 6;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createEmptyErrors() {
  return {};
}

export default function Register() {
  const [step, setStep] = useState(4);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(createEmptyErrors);
  const [generalError, setGeneralError] = useState('');
  const [otpDigits, setOtpDigits] = useState(Array.from({ length: otpLength }, () => ''));
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [creatingExploitation, setCreatingExploitation] = useState(false);
  const [creatingParcelle, setCreatingParcelle] = useState(false);
  const [idAgriculteur, setIdAgriculteur] = useState(null);
  const [idExploitation, setIdExploitation] = useState(null);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [registrationPayload, setRegistrationPayload] = useState(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setResendCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const updateField = (field) => (event) => {
    const value = event.target.value;

    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({
      ...current,
      [field]: '',
    }));
    setGeneralError('');

    if (field === 'email') {
      setEmailVerified(false);
      setVerificationStatus('idle');
      setVerificationMessage('');
      setOtpDigits(Array.from({ length: otpLength }, () => ''));
      setResendCountdown(0);
      setIdAgriculteur(null);
      setIdExploitation(null);
    }
  };

  const updateMapSelection = ({ polygon, superficie, latitude, longitude }) => {
    setFormData((current) => ({
      ...current,
      polygon,
      superficie,
      latitude,
      longitude,
    }));
    setErrors((current) => ({
      ...current,
      polygon: '',
      superficie: '',
      latitude: '',
      longitude: '',
    }));
    setGeneralError('');
  };

  const clearMapSelection = () => {
    setFormData((current) => ({
      ...current,
      polygon: null,
      superficie: '',
      latitude: '',
      longitude: '',
    }));
  };

  const validateStepOne = () => {
    const nextErrors = {};

    if (!formData.prenom.trim()) nextErrors.prenom = 'First name is required';
    if (!formData.nom.trim()) nextErrors.nom = 'Last name is required';
    if (!formData.email.trim()) nextErrors.email = 'Email address is required';
    else if (!emailRegex.test(formData.email.trim())) nextErrors.email = 'Enter a valid email address';
    if (!formData.password) nextErrors.password = 'Password is required';
    else if (formData.password.length < 8) nextErrors.password = 'Password must contain at least 8 characters';
    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords must match';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepThree = () => {
    const nextErrors = {};

    if (!formData.exploitationNom.trim()) nextErrors.exploitationNom = 'Exploitation name is required';
    if (!formData.localisation.trim()) nextErrors.localisation = 'Location is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepFour = () => {
    const nextErrors = {};

    if (!formData.parcelleNom.trim()) nextErrors.parcelleNom = 'Parcel name is required';
    if (!formData.typeSol) nextErrors.typeSol = 'Soil type is required';
    if (!formData.typeCulture) nextErrors.typeCulture = 'Crop type is required';
    if (!formData.superficie) nextErrors.superficie = 'Select a parcel on the map';
    if (!formData.latitude || !formData.longitude) nextErrors.polygon = 'Select a parcel polygon on the map';
    if (!formData.polygon) nextErrors.polygon = 'Select a parcel polygon on the map';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const sendVerificationCode = async () => {
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setGeneralError('Enter a valid email address before requesting the verification code');
      return;
    }

    setSendingCode(true);
    setVerificationStatus('sending');
    setVerificationMessage('');
    setGeneralError('');

    try {
      const response = await apiRequest('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email.trim() }),
      });

      setOtpDigits(Array.from({ length: otpLength }, () => ''));
      setVerificationStatus('sent');
      setVerificationMessage(response.message || `A new 6-digit verification code was sent to ${formData.email.trim()}.`);
      setResendCountdown(60);
    } catch (error) {
      setVerificationStatus('idle');
      setGeneralError(error.message);
    } finally {
      setSendingCode(false);
    }
  };

  const moveToStepTwo = async () => {
    if (!validateStepOne()) {
      return;
    }

    setRegistering(true);
    setGeneralError('');

    try {
      const user = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          prenom: formData.prenom.trim(),
          nom: formData.nom.trim(),
          email: formData.email.trim(),
          mot_de_passe: formData.password,
        }),
      });

      setIdAgriculteur(user.id_agriculteur);
      setIdExploitation(null);
      setOtpDigits(Array.from({ length: otpLength }, () => ''));
      setVerificationStatus('sent');
      setVerificationMessage(`A 6-digit verification code was sent to ${formData.email.trim()}.`);
      setResendCountdown(60);
      setStep(2);
    } catch (error) {
      setGeneralError(error.message);
    } finally {
      setRegistering(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanedValue = value.replace(/\D/g, '');

    if (cleanedValue.length > 1) {
      const pastedDigits = cleanedValue.slice(0, otpLength).split('');
      setOtpDigits((current) => {
        const next = [...current];

        pastedDigits.forEach((digit, pastedIndex) => {
          if (index + pastedIndex < otpLength) {
            next[index + pastedIndex] = digit;
          }
        });

        return next;
      });

      const nextIndex = Math.min(index + pastedDigits.length, otpLength - 1);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    setOtpDigits((current) => {
      const next = [...current];
      next[index] = cleanedValue;
      return next;
    });

    if (cleanedValue && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (index, event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, otpLength);
    if (!pasted) return;
    handleOtpChange(index, pasted);
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async () => {
    const code = otpDigits.join('');

    if (code.length !== otpLength) {
      setGeneralError('Enter the complete 6-digit verification code');
      return;
    }

    setVerifyingCode(true);
    setGeneralError('');

    try {
      await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email.trim(), otp: code }),
      });
      const login = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email.trim(), mot_de_passe: formData.password }),
      });
      window.localStorage.setItem('access_token', login.access_token);

      setEmailVerified(true);
      setVerificationStatus('verified');
      setVerificationMessage('Email verified successfully.');
    } catch (error) {
      setEmailVerified(false);
      setVerificationStatus('sent');
      setGeneralError(error.message);
    } finally {
      setVerifyingCode(false);
    }
  };

  const moveToStepThree = () => {
    if (!emailVerified) {
      setGeneralError('Please verify your email before continuing');
      return;
    }

    setGeneralError('');
    setStep(3);
  };

  const moveToStepFour = async () => {
    if (!validateStepThree()) {
      return;
    }

    setCreatingExploitation(true);
    setGeneralError('');

    try {
      const exploitation = await apiRequest('/exploitations/', {
        method: 'POST',
        body: JSON.stringify({
          nom: formData.exploitationNom.trim(),
          localisation: formData.localisation.trim(),
        }),
      });

      setIdExploitation(exploitation.id_exploitation);
      setStep(4);
    } catch (error) {
      setGeneralError(error.message);
    } finally {
      setCreatingExploitation(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!validateStepFour()) {
      return;
    }

    if (!emailVerified) {
      setGeneralError('Please verify your email before completing registration');
      return;
    }

    if (!idExploitation) {
      setGeneralError('Your exploitation information is missing. Please return to Step 3.');
      return;
    }

    setCreatingParcelle(true);
    setGeneralError('');

    try {
      const parcelle = await apiRequest('/parcelles/', {
        method: 'POST',
        body: JSON.stringify({
          id_exploitation: idExploitation,
          nom: formData.parcelleNom.trim(),
          type_sol: formData.typeSol,
          type_culture: formData.typeCulture,
          superficie: Number(formData.superficie),
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude),
          polygon: formData.polygon,
        }),
      });

      setRegistrationPayload({
        id_agriculteur: idAgriculteur,
        id_exploitation: idExploitation,
        parcelle,
      });
      setRegistrationComplete(true);
    } catch (error) {
      setGeneralError(error.message);
    } finally {
      setCreatingParcelle(false);
    }
  };

  const renderStepOne = () => (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0077B6]">Step 1</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#023047] sm:text-4xl">Create Your Account</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          Enter your personal information to get started with WaterWise.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <FormInput
          label="First Name"
          icon={User}
          placeholder="Omar"
          value={formData.prenom}
          onChange={updateField('prenom')}
          error={errors.prenom}
          autoComplete="given-name"
        />
        <FormInput
          label="Last Name"
          icon={User}
          placeholder="El Mansouri"
          value={formData.nom}
          onChange={updateField('nom')}
          error={errors.nom}
          autoComplete="family-name"
        />
      </div>

      <FormInput
        label="Email Address"
        icon={Mail}
        placeholder="omar@waterwise.com"
        value={formData.email}
        onChange={updateField('email')}
        error={errors.email}
        autoComplete="email"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <FormInput
          label="Password"
          icon={Lock}
          type="password"
          placeholder="Minimum 8 characters"
          value={formData.password}
          onChange={updateField('password')}
          error={errors.password}
          autoComplete="new-password"
        />
        <FormInput
          label="Confirm Password"
          icon={ShieldCheck}
          type="password"
          placeholder="Repeat your password"
          value={formData.confirmPassword}
          onChange={updateField('confirmPassword')}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-full border border-[#0077B6]/15 bg-white px-5 py-3 text-sm font-semibold text-[#023047] transition hover:border-[#0077B6]/30 hover:bg-[#F7FBFC]"
        >
          Back to Sign In
        </Link>
        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={moveToStepTwo}
          disabled={registering}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0077B6] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,119,182,0.24)] transition hover:bg-[#005f94]"
        >
            {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {registering ? 'Creating account' : 'Continue'}
            {!registering ? <ArrowRight className="h-4 w-4" /> : null}
        </motion.button>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0077B6]">Step 2</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#023047] sm:text-4xl">Verify Your Email</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          We&apos;ve sent a 6-digit verification code to your email address.
        </p>
      </header>

      <div className="rounded-[1.75rem] border border-[#CAF0F8] bg-[#F7FBFC] px-5 py-4 text-sm text-slate-600">
        Email: <span className="font-semibold text-[#023047]">{formData.email || 'No email provided yet'}</span>
      </div>

      <div className="space-y-4 rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_12px_36px_rgba(2,48,71,0.06)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[#CAF0F8] p-2 text-[#0077B6]">
            <KeyRound className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-[#023047]">Enter the verification code</p>
          {verificationStatus === 'sending' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#CAF0F8]/70 px-3 py-1 text-xs font-semibold text-[#0077B6]">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending code
            </span>
          ) : null}
          {verificationStatus === 'verified' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Email verified
            </span>
          ) : null}
        </div>

        {verificationMessage ? (
          <div className="rounded-2xl bg-[#CAF0F8]/60 px-4 py-3 text-sm text-[#023047]">
            {verificationMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-6 gap-2 sm:gap-3">
          {otpDigits.map((digit, index) => (
            <motion.input
              key={index}
              ref={(node) => {
                otpRefs.current[index] = node;
              }}
              whileFocus={{ scale: 1.03 }}
              type="text"
              inputMode="numeric"
              maxLength={otpLength}
              value={digit}
              onChange={(event) => handleOtpChange(index, event.target.value)}
              onPaste={(event) => handleOtpPaste(index, event)}
              onKeyDown={(event) => handleOtpKeyDown(index, event)}
              className="h-14 rounded-2xl border border-slate-200 bg-white text-center text-xl font-bold tracking-[0.18em] text-[#023047] outline-none transition placeholder:text-slate-300 focus:border-[#0077B6] focus:ring-4 focus:ring-[#CAF0F8]/60"
            />
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={sendVerificationCode}
            disabled={sendingCode || resendCountdown > 0}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0077B6]/15 bg-white px-5 py-3 text-sm font-semibold text-[#023047] transition hover:border-[#0077B6]/30 hover:bg-[#F7FBFC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {resendCountdown > 0 ? `Resend Code (${resendCountdown}s)` : 'Resend Code'}
          </button>

          <button
            type="button"
            onClick={verifyCode}
            disabled={verifyingCode || emailVerified}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0077B6] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,119,182,0.24)] transition hover:bg-[#005f94] disabled:cursor-not-allowed disabled:bg-[#0ea5c9]"
          >
            {verifyingCode ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
            {emailVerified ? 'Verified' : 'Verify Code'}
          </button>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0077B6]/15 bg-white px-5 py-3 text-sm font-semibold text-[#023047] transition hover:border-[#0077B6]/30 hover:bg-[#F7FBFC]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={moveToStepThree}
          
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0077B6] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,119,182,0.24)] transition hover:bg-[#005f94] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0077B6]">Step 3</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#023047] sm:text-4xl">Add Your Exploitation</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          Tell us about your agricultural exploitation.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <FormInput
          label="Exploitation Name"
          icon={Building2}
          placeholder="Ferme Al Amal"
          value={formData.exploitationNom}
          onChange={updateField('exploitationNom')}
          error={errors.exploitationNom}
        />
        <FormInput
          label="Location"
          icon={MapPin}
          placeholder="Taroudant, Souss-Massa, Morocco"
          value={formData.localisation}
          onChange={updateField('localisation')}
          error={errors.localisation}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0077B6]/15 bg-white px-5 py-3 text-sm font-semibold text-[#023047] transition hover:border-[#0077B6]/30 hover:bg-[#F7FBFC]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={moveToStepFour}
          disabled={creatingExploitation}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0077B6] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,119,182,0.24)] transition hover:bg-[#005f94]"
        >
            {creatingExploitation ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {creatingExploitation ? 'Creating exploitation' : 'Continue'}
            {!creatingExploitation ? <ArrowRight className="h-4 w-4" /> : null}
        </motion.button>
      </div>
    </div>
  );

  const renderStepFour = () => (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0077B6]">Step 4</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#023047] sm:text-4xl">Add Your First Parcel</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
          Provide information about your parcel and select its exact area on the map.
        </p>
      </header>

      {/* Two-column split: form left, map right */}
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* 鈹€鈹€ Left column: form fields 鈹€鈹€ */}
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-[0_12px_36px_rgba(2,48,71,0.06)] backdrop-blur">
          <FormInput
            label="Parcel Name"
            icon={MapPin}
            placeholder="Parcel Delta 12"
            value={formData.parcelleNom}
            onChange={updateField('parcelleNom')}
            error={errors.parcelleNom}
          />

          <FormSelect
            label="Soil Type"
            icon={Building2}
            value={formData.typeSol}
            onChange={updateField('typeSol')}
            error={errors.typeSol}
          >
            <option value="">Select soil type</option>
            {soilOptions.map((soil) => (
              <option key={soil} value={soil}>
                {soil}
              </option>
            ))}
          </FormSelect>

          <FormSelect
            label="Crop Type"
            icon={User}
            value={formData.typeCulture}
            onChange={updateField('typeCulture')}
            error={errors.typeCulture}
          >
            <option value="">Select crop type</option>
            {cropOptions.map((crop) => (
              <option key={crop} value={crop}>
                {crop}
              </option>
            ))}
          </FormSelect>

          {/* Auto-calculated fields */}
          <div className="mt-auto space-y-4 rounded-[1.25rem] border border-[#CAF0F8]/60 bg-[#F7FBFC] p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Map-derived values
            </p>
            <FormInput
              label="Surface Area (ha)"
              icon={MapPin}
              placeholder="Auto-calculated"
              value={formData.superficie}
              readOnly
              error={errors.superficie}
              inputClassName="bg-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Latitude"
                icon={MapPin}
                value={formData.latitude}
                onChange={updateField('latitude')}
                placeholder="e.g. 30.4278"
                error={errors.latitude}
                inputClassName="bg-white"
              />
              <FormInput
                label="Longitude"
                icon={MapPin}
                value={formData.longitude}
                onChange={updateField('longitude')}
                placeholder="e.g. -9.5981"
                error={errors.longitude}
                inputClassName="bg-white"
              />
            </div>
          </div>

          {errors.polygon ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
              {errors.polygon}
            </p>
          ) : null}
        </div>

        {/* 鈹€鈹€ Right column: map 鈹€鈹€ */}
        <Suspense
          fallback={
            <div className="flex min-h-[480px] items-center justify-center rounded-[1.75rem] border border-white/80 bg-white/75 shadow-[0_18px_60px_rgba(2,48,71,0.08)] backdrop-blur-xl">
              <div className="flex items-center gap-3 rounded-2xl bg-[#CAF0F8]/70 px-4 py-3 text-sm font-semibold text-[#023047]">
                <Loader2 className="h-4 w-4 animate-spin text-[#0077B6]" />
                Loading parcel map�?
              </div>
            </div>
          }
        >
          <ParcelMap
            value={formData}
            onChange={updateMapSelection}
            onClear={clearMapSelection}
          />
        </Suspense>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setStep(3)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0077B6]/15 bg-white px-5 py-3 text-sm font-semibold text-[#023047] transition hover:border-[#0077B6]/30 hover:bg-[#F7FBFC]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <motion.button
          type="button"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCompleteRegistration}
          disabled={creatingParcelle}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0077B6] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,119,182,0.24)] transition hover:bg-[#005f94]"
        >
          {creatingParcelle ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {creatingParcelle ? 'Creating parcel' : 'Complete Registration'}
        </motion.button>
      </div>

      {registrationComplete && registrationPayload ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Registration completed successfully</p>
              <p className="mt-1 text-emerald-700">
                Your account, exploitation, and first parcel have been created.
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7FBFC] px-4 py-8 text-[#0F172A] sm:px-6 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(72,202,228,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(0,119,182,0.12),_transparent_24%)]" />
      <div className="pointer-events-none absolute left-1/2 top-14 h-72 w-72 -translate-x-1/2 rounded-full bg-[#CAF0F8]/80 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-col gap-6">

        <StepIndicator currentStep={step} />

        {generalError ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.5rem] border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700"
          >
            {generalError}
          </motion.div>
        ) : null}

        <div className="rounded-[2.25rem] border border-white/75 bg-white/82 p-5 shadow-[0_24px_70px_rgba(2,48,71,0.08)] backdrop-blur-xl sm:p-7 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {step === 1 ? renderStepOne() : null}
              {step === 2 ? renderStepTwo() : null}
              {step === 3 ? renderStepThree() : null}
              {step === 4 ? renderStepFour() : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 rounded-[2rem] border border-white/70 bg-white/70 px-5 py-4 text-sm text-slate-500 shadow-[0_16px_44px_rgba(2,48,71,0.05)] backdrop-blur sm:flex-row">
          <p></p>
          <Link to="/login" className="font-semibold text-[#0077B6] transition hover:text-[#005f94]">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}


