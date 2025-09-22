import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/layout/card';
import { Button } from '../../ui/forms/button';
import { Badge } from '../../ui/feedback/badge';
import { Shield, User, CheckCircle, XCircle } from 'lucide-react';

export const AdminVerification: React.FC = () => {
  const navigate = useNavigate();
  const { state: authState } = useAuth();

  const isAdmin = authState.user?.role === 'admin';
  const isAuthenticated = authState.isAuthenticated;

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Access Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Authentication Status
              </span>
              {isAuthenticated ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Authenticated
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Authenticated
                </Badge>
              )}
            </div>

            {isAuthenticated && (
              <>
                <div className="flex items-center justify-between">
                  <span>User Email</span>
                  <Badge variant="outline">{authState.user?.email || 'No email'}</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>User Role</span>
                  <Badge variant={isAdmin ? 'default' : 'secondary'}>
                    {authState.user?.role || 'No role'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span>Admin Access</span>
                  {isAdmin ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Granted
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Denied
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Debug Information</h4>
            <div className="bg-muted p-3 rounded text-sm">
              <pre>{JSON.stringify(authState, null, 2)}</pre>
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin ? (
              <Button onClick={() => navigate('/admin')} className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Access Admin Dashboard
              </Button>
            ) : (
              <Button variant="outline" disabled>
                Admin Access Required
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};