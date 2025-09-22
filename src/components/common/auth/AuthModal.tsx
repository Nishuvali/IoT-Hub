import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'login' 
}) => {
  const { login, register, state } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      toast.success('Welcome back!');
      onClose();
      setLoginData({ email: '', password: '' });
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await register({
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName
      });
      toast.success('Account created successfully! Welcome to TechStore!');
      onClose();
      setRegisterData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to TechStore</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={state.isLoading}
              >
                {state.isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="register-firstName">First Name</Label>
                  <Input
                    id="register-firstName"
                    name="firstName"
                    value={registerData.firstName}
                    onChange={handleRegisterInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-lastName">Last Name</Label>
                  <Input
                    id="register-lastName"
                    name="lastName"
                    value={registerData.lastName}
                    onChange={handleRegisterInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleRegisterInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirmPassword">Confirm Password</Label>
                <Input
                  id="register-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterInputChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={state.isLoading}
              >
                {state.isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};