import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus('verifying');
    try {
      await authApi.verifyEmail(verificationToken);
      setStatus('success');
      toast.success('Email verified successfully!');
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.message || 'Failed to verify email. The link may have expired.');
      toast.error(error.message || 'Verification failed');
    }
  };

  const resendVerification = async () => {
    try {
      const result = await authApi.sendVerificationEmail() as any;
      toast.success('Verification email sent! Check your inbox.');
      
      // In development, show the verification URL if provided
      if (result?.verificationUrl) {
        console.log('Verification URL:', result.verificationUrl);
        toast.info(`Development Mode: Click here to verify`, {
          description: result.verificationUrl,
          duration: 10000,
          action: {
            label: 'Copy URL',
            onClick: () => {
              navigator.clipboard.writeText(result.verificationUrl);
              toast.success('URL copied to clipboard');
            }
          }
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar variant="light" />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {status === 'verifying' && (
                  <Loader2 className="w-16 h-16 text-gold-600 animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                )}
                {status === 'error' && (
                  <XCircle className="w-16 h-16 text-destructive" />
                )}
                {status === 'idle' && (
                  <Mail className="w-16 h-16 text-gold-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {status === 'verifying' && 'Verifying Your Email'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
                {status === 'idle' && 'Email Verification'}
              </CardTitle>
              <CardDescription>
                {status === 'verifying' && 'Please wait while we verify your email address...'}
                {status === 'success' && 'Your email has been successfully verified. Redirecting to dashboard...'}
                {status === 'error' && errorMessage}
                {status === 'idle' && 'Click the link in your email to verify your account'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === 'error' && (
                <>
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{errorMessage}</p>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={resendVerification} variant="gold" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                      Go to Dashboard
                    </Button>
                  </div>
                </>
              )}
              
              {status === 'idle' && (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    We've sent a verification email to your inbox. Please click the link in the email to verify your account.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 mb-2">
                        <strong>Development Mode:</strong> Check the browser console or backend logs for the verification URL.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Button onClick={resendVerification} variant="gold" className="w-full">
                      <Mail className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                      Go to Dashboard
                    </Button>
                  </div>
                </>
              )}

              {status === 'success' && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    You can now submit loan requests and access all features.
                  </p>
                  <Button onClick={() => navigate('/dashboard')} variant="gold" className="w-full">
                    Continue to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Need help? <Link to="/contact" className="text-primary hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

