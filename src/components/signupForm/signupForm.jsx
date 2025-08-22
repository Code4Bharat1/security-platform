'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SignUp() {
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

    // If there are no validation errors, proceed with signup
    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_PROD_API_URL}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${formData.fname} ${formData.lname}`,
            email: formData.email,
            password: formData.password,
          }),
        });

        const result = await res.json();
        // Check if the response was successful and show appropriate message
        if (res.ok) {
          setMessage('Signup successful! Please login.');
        } else {
          setMessage(result.message || 'Signup failed');
        }
      } catch (err) {
        console.error('Signup error:', err);
        setMessage('Something went wrong.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="bg-[#1e293b] text-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-4xl font-extrabold mb-2 text-gray-200 text-center">Create an Account</h2>
        <p className="text-sm text-gray-100 mb-6 text-center">
          Please enter your details to create an account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-3 mb-4">
            <div className="w-1/2">
              <label className="block text-gray-100 text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                name="fname"
                placeholder="First Name"
                value={formData.fname}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.fname ? 'border-red-500' : 'border-gray-300'
                } rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#9d7af0] text-black`}
                autoComplete="given-name"
              />
              {errors.fname && <p className="text-red-500 text-sm mt-1">{errors.fname}</p>}
            </div>
            <div className="w-1/2">
              <label className="block text-gray-100 text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                name="lname"
                placeholder="Last Name"
                value={formData.lname}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${
                  errors.lname ? 'border-red-500' : 'border-gray-300'
                } rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#9d7af0] text-black`}
                autoComplete="family-name"
              />
              {errors.lname && <p className="text-red-500 text-sm mt-1">{errors.lname}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-100 text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#9d7af0] text-black`}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4 relative">
            <label className="block text-white text-sm font-medium mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#9d7af0] text-black`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-10 text-gray-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="mb-4 relative">
            <label className="block text-white text-sm font-medium mb-1">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#9d7af0] text-black`}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-10 text-gray-600"
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="terms"
              className="mr-2 h-4 w-4 rounded border-gray-300 text-[#9d7af0] focus:ring-[#9d7af0]"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
            />
            <label htmlFor="terms" className="text-sm text-gray-100">
              I accept the{' '}
              <a href="#" className="text-[#9d7af0] font-medium hover:underline">
                Terms of Use
              </a>{' '}
              &{' '}
              <a href="#" className="text-[#9d7af0] font-medium hover:underline">
                Privacy Policy
              </a>
              .
            </label>
          </div>
          {errors.accepted && <p className="text-red-500 text-sm mt-1">{errors.accepted}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-center text-white mt-6 bg-[#9d7af0] py-3 rounded-lg hover:bg-[#a67fea] transition font-semibold ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-medium ${
              message.includes('success') ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-gray-100 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#9d7af0] font-medium hover:underline">
            Gain Access here.
          </Link>
        </p>
      </div>
    </div>
  );
}
