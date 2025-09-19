import React, { useState } from 'react';
import { Eye, EyeOff, User, Phone, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean>;
  onSignup: (userData: SignupData) => Promise<boolean>;
}

interface LoginCredentials {
  identifier: string;
  identifierType: 'username' | 'phone';
  password: string;
}

interface SignupData {
  fullName: string;
  username: string;
  phone: string;
  email: string;
  password: string;
}

export function AuthForm({ onLogin, onSignup }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: '',
    identifierType: 'username' as 'username' | 'phone',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Validation functions
  const validateUsername = (username: string): string | null => {
    if (username.length < 3 || username.length > 20) {
      return 'Username must be 3-20 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!/^\+\d{10,15}$/.test(phone)) {
      return 'Phone number must include country code (e.g., +1234567890)';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const validateLoginForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!loginData.identifier.trim()) {
      newErrors.identifier = `${loginData.identifierType === 'username' ? 'Username' : 'Phone number'} is required`;
    } else if (loginData.identifierType === 'phone') {
      const phoneError = validatePhone(loginData.identifier);
      if (phoneError) newErrors.identifier = phoneError;
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signupData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const usernameError = validateUsername(signupData.username);
    if (usernameError) newErrors.username = usernameError;

    const phoneError = validatePhone(signupData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const emailError = validateEmail(signupData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(signupData.password);
    if (passwordError) newErrors.password = passwordError;

    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    try {
      const success = await onLogin({
        identifier: loginData.identifier,
        identifierType: loginData.identifierType,
        password: loginData.password
      });
      
      if (!success) {
        setErrors({ general: 'Invalid credentials. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'Login failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignupForm()) return;

    setIsLoading(true);
    try {
      const success = await onSignup({
        fullName: signupData.fullName,
        username: signupData.username,
        phone: signupData.phone,
        email: signupData.email,
        password: signupData.password
      });
      
      if (success) {
        setErrors({ success: 'Account created successfully! You are now logged in.' });
      } else {
        setErrors({ general: 'Signup failed. Username may already exist.' });
      }
    } catch (error) {
      setErrors({ general: 'Signup failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ 
    label, 
    type, 
    value, 
    onChange, 
    error, 
    placeholder, 
    icon: Icon,
    showPasswordToggle = false,
    showPassword: showPass = false,
    onTogglePassword
  }: {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder: string;
    icon: React.ComponentType<{ className?: string }>;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <Icon className="inline h-4 w-4 mr-1" />
        {label}
      </label>
      <div className="relative">
        <input
          type={showPasswordToggle ? (showPass ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 ${showPasswordToggle ? 'pr-12' : ''} rounded-lg border ${
            error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
          } focus:ring-2 focus:border-transparent transition-all duration-200`}
          placeholder={placeholder}
        />
        {showPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
        <button
          onClick={() => {
            setMode('login');
            setErrors({});
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === 'login'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Login
        </button>
        <button
          onClick={() => {
            setMode('signup');
            setErrors({});
          }}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            mode === 'signup'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Success Message */}
      {errors.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm text-green-800">{errors.success}</p>
          </div>
        </div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{errors.general}</p>
          </div>
        </div>
      )}

      {mode === 'login' ? (
        /* LOGIN FORM */
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Identifier Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Login with:
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="username"
                  checked={loginData.identifierType === 'username'}
                  onChange={(e) => setLoginData({ 
                    ...loginData, 
                    identifierType: e.target.value as 'username' | 'phone',
                    identifier: '' 
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Username</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="phone"
                  checked={loginData.identifierType === 'phone'}
                  onChange={(e) => setLoginData({ 
                    ...loginData, 
                    identifierType: e.target.value as 'username' | 'phone',
                    identifier: '' 
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Phone Number</span>
              </label>
            </div>
          </div>

          <InputField
            label={loginData.identifierType === 'username' ? 'Username' : 'Phone Number'}
            type={loginData.identifierType === 'phone' ? 'tel' : 'text'}
            value={loginData.identifier}
            onChange={(value) => setLoginData({ ...loginData, identifier: value })}
            error={errors.identifier}
            placeholder={loginData.identifierType === 'username' ? 'Enter your username' : 'Enter phone with country code (+1234567890)'}
            icon={loginData.identifierType === 'username' ? User : Phone}
          />

          <InputField
            label="Password"
            type="password"
            value={loginData.password}
            onChange={(value) => setLoginData({ ...loginData, password: value })}
            error={errors.password}
            placeholder="Enter your password"
            icon={Lock}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      ) : (
        /* SIGNUP FORM */
        <form onSubmit={handleSignup} className="space-y-6">
          <InputField
            label="Full Name"
            type="text"
            value={signupData.fullName}
            onChange={(value) => setSignupData({ ...signupData, fullName: value })}
            error={errors.fullName}
            placeholder="Enter your full name"
            icon={User}
          />

          <InputField
            label="Username"
            type="text"
            value={signupData.username}
            onChange={(value) => setSignupData({ ...signupData, username: value })}
            error={errors.username}
            placeholder="3-20 characters, letters, numbers, underscores only"
            icon={User}
          />

          <InputField
            label="Phone Number"
            type="tel"
            value={signupData.phone}
            onChange={(value) => setSignupData({ ...signupData, phone: value })}
            error={errors.phone}
            placeholder="Include country code (+1234567890)"
            icon={Phone}
          />

          <InputField
            label="Email Address"
            type="email"
            value={signupData.email}
            onChange={(value) => setSignupData({ ...signupData, email: value })}
            error={errors.email}
            placeholder="Enter your email address"
            icon={Mail}
          />

          <InputField
            label="Password"
            type="password"
            value={signupData.password}
            onChange={(value) => setSignupData({ ...signupData, password: value })}
            error={errors.password}
            placeholder="Min 8 chars, uppercase, lowercase, number, special char"
            icon={Lock}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <InputField
            label="Confirm Password"
            type="password"
            value={signupData.confirmPassword}
            onChange={(value) => setSignupData({ ...signupData, confirmPassword: value })}
            error={errors.confirmPassword}
            placeholder="Re-enter your password"
            icon={Lock}
            showPasswordToggle={true}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      )}

      {/* Demo Credentials (for login mode only) */}
      {mode === 'login' && (
        <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-1">Demo Credentials:</p>
          <p className="text-xs text-blue-700">Username: demo | Password: Demo123!</p>
          <p className="text-xs text-blue-700">Phone: +1234567890 | Password: Demo123!</p>
        </div>
      )}
    </div>
  );
}