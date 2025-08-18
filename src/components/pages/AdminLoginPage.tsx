
import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

interface AdminLoginPageProps {
  onLogin: (user: string, pass: string) => void;
  error?: string;
  onBack: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, error, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="glassmorphism rounded-xl p-8 md:p-12 z-10 animate-fade-in">
          <div className="flex justify-center mb-8">
            <Logo />
          </div>
          <h1 className="text-3xl font-light text-white text-center mb-6">Admin Login</h1>
          <form onSubmit={handleSubmit}>
            <Input
              label="Username"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}
            <div className="mt-8 flex flex-col items-center gap-4">
               <Button type="submit" size="large" className="w-full">
                 Login
               </Button>
               <Button onClick={onBack} variant="secondary" className="w-full">
                 Back to Home
               </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default AdminLoginPage;
