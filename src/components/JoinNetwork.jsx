'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, X } from 'lucide-react'; // <-- Added X icon
import { useRouter } from 'next/navigation';
import axios from 'axios';
export default function JoinNetwork() {
  // State to manage form data
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // State to manage form validation errors and success/error messages
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for terms acceptance and loading status
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Handle changes to form inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear the error for the changed field
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Basic form validation
    if (!formData.fname) newErrors.fname = 'First name is required';
    if (!formData.lname) newErrors.lname = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!accepted) newErrors.accepted = 'Please accept the terms';

    setErrors(newErrors);
    setMessage('');

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/signup`,
          {
            name: `${formData.fname} ${formData.lname}`,
            email: formData.email,
            password: formData.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const result = res.data;

        if (res.status === 200 || res.status === 201) {
          setMessage('Signup successful! Please login.');
          // Optional: redirect to login page
          // router.push('/login');
        } else {
          setMessage(result.message || 'Signup failed');
        }
      } catch (err) {
        console.error('Signup error:', err);
        setMessage(err.response?.data?.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 text-[color:var(--text-body)]">
      <div className="relative w-full max-w-md rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-card)] p-8 text-[color:var(--text-body)] shadow-[var(--shadow-elevated)]">

        {/* Close Button */}
        <button
          onClick={() => router.push('/gain-access')}
          className="absolute top-3 right-3 text-[color:var(--text-muted)] hover:text-[color:var(--text-heading)]"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="mb-2 text-center text-4xl font-extrabold text-[color:var(--text-heading)]">Create an Account</h2>
        <p className="mb-6 text-center text-sm text-[color:var(--text-muted)]">
          Please enter your details to create an account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* First & Last Name */}
          <div className="flex gap-3 mb-4">
            <div className="w-1/2">
              <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">First Name</label>
              <input
                type="text"
                name="fname"
                placeholder="First Name"
                value={formData.fname}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2 ${errors.fname ? 'border-[color:var(--danger)]' : 'border-[color:var(--border)]'
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                autoComplete="given-name"
              />
              {errors.fname && <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.fname}</p>}
            </div>
            <div className="w-1/2">
              <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">Last Name</label>
              <input
                type="text"
                name="lname"
                placeholder="Last Name"
                value={formData.lname}
                onChange={handleChange}
                className={`w-full rounded-lg border px-4 py-2 ${errors.lname ? 'border-[color:var(--danger)]' : 'border-[color:var(--border)]'
                  } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
                autoComplete="family-name"
              />
              {errors.lname && <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.lname}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 ${errors.email ? 'border-[color:var(--danger)]' : 'border-[color:var(--border)]'
                } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
              autoComplete="email"
            />
            {errors.email && <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="mb-4 relative">
            <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 ${errors.password ? 'border-[color:var(--danger)]' : 'border-[color:var(--border)]'
                } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-10 text-[color:var(--text-muted)] hover:text-[color:var(--gold)]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="mb-4 relative">
            <label className="mb-1 block text-sm font-medium text-[color:var(--text-body)]">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2 ${errors.confirmPassword ? 'border-[color:var(--danger)]' : 'border-[color:var(--border)]'
                } bg-[color:var(--surface-subtle)] text-[color:var(--text-body)] placeholder:text-[color:var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-10 text-[color:var(--text-muted)] hover:text-[color:var(--gold)]"
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="terms"
              className="mr-2 h-4 w-4 rounded border-[color:var(--border)] text-[color:var(--gold)] focus:ring-[color:var(--ring)]"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
            />
            <label htmlFor="terms" className="text-sm text-[color:var(--text-body)]">
              I accept the{' '}
              <a href="#" className="font-medium text-[color:var(--gold)] hover:text-[color:var(--gold-strong)] hover:underline">
                Terms of Use
              </a>{' '}
              &{' '}
              <a href="#" className="font-medium text-[color:var(--gold)] hover:text-[color:var(--gold-strong)] hover:underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>
          {errors.accepted && <p className="mt-1 text-sm text-[color:var(--danger)]">{errors.accepted}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`mt-6 w-full rounded-lg border border-[color:var(--gold)] bg-[color:var(--gold)] py-3 text-center font-semibold text-[color:var(--text-inverse)] hover:bg-[color:var(--gold-strong)] ${loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {loading ? 'Adding to Whitelist...' : 'Join the Network'}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-4 text-center font-medium ${message.includes('success') ? 'text-[color:var(--success)]' : 'text-[color:var(--danger)]'
              }`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
          Already have an account?{' '}
          <Link href="/gain-access" className="font-medium text-[color:var(--gold)] hover:text-[color:var(--gold-strong)] hover:underline">
            Gain Access here.
          </Link>
        </p>
      </div>
    </div>
  );
}
