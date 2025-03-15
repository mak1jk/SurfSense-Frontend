import TokenHandler from '@/components/TokenHandler';

export default function AuthCallbackPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Authentication Callback</h1>
      <TokenHandler 
        redirectPath="/dashboard" 
        tokenParamName="token" 
        storageKey="surfsense_bearer_token" 
      />
    </div>
  );
} 