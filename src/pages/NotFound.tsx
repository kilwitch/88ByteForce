
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const NotFound = () => {
  const { user } = useAuth();
  const redirectPath = user ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-brand-blue mb-6">404</h1>
        <p className="text-3xl font-medium mb-4">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We can't seem to find the page you're looking for. It might have been moved or deleted.
        </p>
        <Button asChild>
          <Link to={redirectPath}>
            Go back to {user ? 'Dashboard' : 'Login'}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
