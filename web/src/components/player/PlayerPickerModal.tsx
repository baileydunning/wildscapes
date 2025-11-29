import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlayer } from '@/context/PlayerContext';
import { UserSearch } from './UserSearch';
import { PlayerList } from './PlayerList';
import { CreateUserForm } from './CreateUserForm';
import { User, Player } from '@/types/player';

interface PlayerPickerModalProps {
  // Optional controlled mode for seat selection
  isOpen?: boolean;
  onClose?: () => void;
  onSelectPlayer?: (player: Player, user: User) => void;
}

export function PlayerPickerModal(props: PlayerPickerModalProps) {
  const { isModalOpen, closeModal, setPlayer } = usePlayer();
  const { isOpen, onClose, onSelectPlayer } = props;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [mode, setMode] = useState<'search' | 'players' | 'create'>('search');

  // Decide where open/close comes from:
  const dialogOpen = typeof isOpen === 'boolean' ? isOpen : isModalOpen;

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setMode('players');
  };

  const handleSelectPlayer = (player: Player) => {
    if (!selectedUser) return;

    if (onSelectPlayer) {
      // Seat selection mode: let parent decide what to do
      onSelectPlayer(player, selectedUser);
    } else {
      // Default/global mode: update PlayerContext currentPlayer
      setPlayer(player, selectedUser);
    }
    handleClose();
  };

  const handleCreated = (user: User, player: Player) => {
    if (onSelectPlayer) {
      onSelectPlayer(player, user);
    } else {
      setPlayer(player, user);
    }
    handleClose();
  };

  const handleBack = () => {
    setSelectedUser(null);
    setMode('search');
  };

  const handleClose = () => {
    setSelectedUser(null);
    setMode('search');
    if (onClose) {
      onClose();
    } else {
      closeModal();
    }
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">Choose Player</DialogTitle>
        </DialogHeader>

        {mode === 'search' && (
          <Tabs defaultValue="existing" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing" className="font-sans">
                Existing User
              </TabsTrigger>
              <TabsTrigger value="new" className="font-sans">
                New User
              </TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="mt-4">
              <UserSearch onSelectUser={handleSelectUser} />
            </TabsContent>
            <TabsContent value="new" className="mt-4">
              <CreateUserForm onCreated={handleCreated} onBack={() => {}} />
            </TabsContent>
          </Tabs>
        )}

        {mode === 'players' && selectedUser && (
          <PlayerList
            user={selectedUser}
            onSelectPlayer={handleSelectPlayer}
            onBack={handleBack}
          />
        )}

        {mode === 'create' && (
          <CreateUserForm onCreated={handleCreated} onBack={handleBack} />
        )}
      </DialogContent>
    </Dialog>
  );
}
