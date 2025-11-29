import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { usePlayer } from '@/context/PlayerContext';
import { User, Player } from '@/types/player';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateUserFormProps {
  onCreated: (user: User, player: Player) => void;
  onBack: () => void;
}

const SUGGESTED_EMOJIS = [
  '🦊', '🐿️', '🦉', '🐻', '🦝', '🦫', '🦅', '🐢', '🐟'
];

function getEmojiShortcutPlaceholder() {
  if (typeof navigator === 'undefined') return 'Use emoji shortcut';

  const ua = navigator.userAgent || '';
  const isMac = /Macintosh|Mac OS X/.test(ua);
  const isWin = /Windows/.test(ua);

  if (isMac) return 'Press ⌃⌘Space for emoji';
  if (isWin) return 'Press Win + . for emoji';
  return 'Use your OS emoji shortcut';
}

export function CreateUserForm({ onCreated, onBack }: CreateUserFormProps) {
  const { createUser } = usePlayer();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🦊');
  const [customEmoji, setCustomEmoji] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emojiPlaceholder = useMemo(getEmojiShortcutPlaceholder, []);
  const effectiveEmoji = customEmoji || selectedEmoji;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) return setError('Display name is required');
    if (!handle.trim()) return setError('Handle is required');
    if (!/^[a-zA-Z0-9_]+$/.test(handle))
      return setError('Handle can only contain letters, numbers, and underscores');
    if (!effectiveEmoji) return setError('Please choose an avatar emoji');

    setIsLoading(true);
    try {
      const { user, player } = await createUser(
        displayName.trim(),
        handle.trim().toLowerCase(),
        effectiveEmoji
      );
      onCreated(user, player);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEmojiChange = (value: string) => {
    // keep only one emoji
    const trimmed = value.trim();
    setCustomEmoji(trimmed.slice(0, 2));
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        type="button"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans"
      >
        ← Back
      </button>

      <div>
        <h3 className="font-semibold text-foreground font-sans">
          Create New User
        </h3>
        <p className="text-sm text-muted-foreground font-sans">
          Set up your account and start playing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Display Name */}
        <div className="space-y-2">
          <Label className="font-sans">Display Name</Label>
          <Input
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="font-sans"
          />
        </div>

        {/* Handle */}
        <div className="space-y-2">
          <Label className="font-sans">Handle</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
            <Input
              value={handle}
              placeholder="username"
              onChange={(e) =>
                setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
              }
              className="pl-8 font-sans"
            />
          </div>
        </div>

        {/* Avatar Emoji Picker */}
        <div className="space-y-2">
          <Label className="font-sans">Avatar Emoji</Label>

          {/* Suggested emojis */}
          <div className="flex flex-wrap gap-2 mb-1">
            {SUGGESTED_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  setSelectedEmoji(emoji);
                  setCustomEmoji('');
                }}
                className={cn(
                  'w-9 h-9 rounded-lg border flex items-center justify-center text-xl transition-all',
                  effectiveEmoji === emoji
                    ? 'border-primary bg-primary/10 scale-105 shadow-sm'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Custom emoji input with native OS picker shortcut as placeholder */}
          <Input
            placeholder={emojiPlaceholder}
            value={customEmoji}
            onChange={(e) => handleCustomEmojiChange(e.target.value)}
            className="font-sans text-center text-xl cursor-text"
            onFocus={(e) => e.target.select()} // helpful for quickly replacing emoji
          />

          {/* Preview */}
          <div className="mt-1 text-xs text-muted-foreground font-sans flex items-center gap-2">
            <span>Preview:</span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-xl">
              {effectiveEmoji || '❓'}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-destructive font-sans">{error}</p>}

        <Button type="submit" disabled={isLoading} className="w-full font-sans">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </div>
  );
}
