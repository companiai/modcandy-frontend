import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, Trash2, BookOpen, CreditCard } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

interface ApiKeyData {
  keyname: string;
  created: string;
  key_prefix: string;
}

interface CreditData {
  credit_used: number;
  credit_remaining: number;
  username: string;
}

interface SettingsProps {
  token: string;
}

function Settings({ token }: SettingsProps) {
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData | null>(null);
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    Promise.all([fetchApiKey(), fetchCreditUsage()]);
  }, [token]);

  const fetchCreditUsage = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CREDIT, {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCreditData(data);
      }
    } catch (err) {
      console.error('Error fetching credit usage:', err);
    }
  };

  const fetchApiKey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.API_KEY, {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      
      if (response.status === 404) {
        setApiKeyData(null);
      } else if (response.ok) {
        const data = await response.json();
        setApiKeyData(data);
      } else {
        throw new Error('Failed to fetch API key');
      }
    } catch (err) {
      setError('Failed to load API key information');
      console.error('Error fetching API key:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.API_KEY, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyname: newKeyName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      setNewlyCreatedKey(data.key);
      await fetchApiKey();
      setNewKeyName('');
    } catch (err) {
      setError('Failed to create API key');
      console.error('Error creating API key:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteApiKey = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.API_KEY, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setApiKeyData(null);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError('Failed to delete API key');
      console.error('Error deleting API key:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyKey = async () => {
    if (newlyCreatedKey) {
      try {
        await navigator.clipboard.writeText(newlyCreatedKey);
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy key:', err);
      }
    }
  };

  const handleDismissNewKey = () => {
    setNewlyCreatedKey(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Settings</h2>
        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-400">Loading API key information...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-medium">API Key Management</h3>
            </div>
            {apiKeyData && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                title="Delete API Key"
              >
                <Trash2 size={18} />
                Delete Key
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {showDeleteConfirm && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <h4 className="text-red-400 font-medium mb-2">Delete API Key?</h4>
              <p className="text-gray-400 text-sm mb-4">
                This action cannot be undone. The API key will be permanently deleted and any services using it will stop working.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDeleteApiKey}
                  disabled={isDeleting}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Key'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {newlyCreatedKey && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-green-400 font-medium">New API Key Created</h4>
                <button
                  onClick={handleDismissNewKey}
                  className="text-gray-400 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Copy your API key now. You won't be able to see it again!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono bg-[#0a0b14] p-2 rounded border border-gray-700">
                  {newlyCreatedKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={20} />
                </button>
              </div>
              {showCopySuccess && (
                <p className="text-green-400 text-sm mt-2">Copied to clipboard!</p>
              )}
            </div>
          )}

          {!apiKeyData ? (
            <div className="space-y-4">
              <p className="text-gray-400">
                You haven't created an API key yet. Create one to integrate with our services.
              </p>
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div>
                  <label htmlFor="keyname" className="block text-sm font-medium text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="keyname"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Enter a name for your API key"
                    className="w-full px-4 py-2 bg-[#0a0b14] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
                    disabled={isCreating}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isCreating || !newKeyName.trim()}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Key size={18} />
                  {isCreating ? 'Creating...' : 'Create API Key'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-[#0a0b14] border border-gray-700 rounded-lg">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-400">Name</div>
                    <div className="font-medium">{apiKeyData.keyname}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-gray-400">Created</div>
                    <div className="font-medium">
                      {new Date(apiKeyData.created).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-[#0a0b14] border border-gray-700 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">API Key</div>
                  <div className="font-mono">{apiKeyData.key_prefix}*******</div>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Your API key is active and can be used to authenticate API requests.
              </p>
            </div>
          )}
        </div>

        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium">Credit Usage</h3>
          </div>
          {creditData ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                <span>Credits Used: {creditData.credit_used}</span>
                <span>Credits Remaining: {creditData.credit_remaining}</span>
              </div>
              <div className="w-full bg-[#0a0b14] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500"
                  style={{ 
                    width: `${(creditData.credit_used / (creditData.credit_used + creditData.credit_remaining)) * 100}%` 
                  }}
                />
              </div>
              <p className="text-sm text-gray-400">
                Reach out to us if you need more credits at{' '}
                <a href="mailto:info@compani.ai" className="text-blue-400 hover:text-blue-300">
                  info@compani.ai
                </a>
              </p>
            </div>
          ) : (
            <div className="text-gray-400">Loading credit information...</div>
          )}
        </div>

        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-medium">Documentation</h3>
          </div>
          <p className="text-gray-400 mb-4">
            Learn how to integrate Modcandy into your application with our comprehensive documentation.
          </p>
          <a
            href="https://docs.compani.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors"
          >
            <BookOpen size={18} />
            View Documentation
          </a>
        </div>
      </div>
    </div>
  );
}

export default Settings;