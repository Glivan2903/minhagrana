import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  const userInitials = username
    .split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase();

  const [notifOpen, setNotifOpen] = React.useState(false);
  const [emailNotif, setEmailNotif] = React.useState(false);
  const [whatsNotif, setWhatsNotif] = React.useState(false);
  const [daysBefore, setDaysBefore] = React.useState(1);

  return (
    <header className="border-b bg-white px-6 py-3">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4">
          <Dialog open={notifOpen} onOpenChange={setNotifOpen}>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(true)}>
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-minhagrana-primary text-[10px] text-white">
                3
              </span>
            </Button>
            <DialogContent className="max-w-md">
              <form onSubmit={e => { e.preventDefault(); setNotifOpen(false); }}>
                <DialogHeader>
                  <DialogTitle>Preferências de Notificações</DialogTitle>
                  <span className="text-sm text-gray-500">Configure como deseja receber notificações. Estas são suas preferências pessoais.</span>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Notificações Gerais por E-mail</div>
                      <div className="text-xs text-gray-500">Receber e-mails sobre atividades importantes da conta e novidades.</div>
                    </div>
                    <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                  </div>
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">Notificações Gerais por WhatsApp</div>
                      <div className="text-xs text-gray-500">Receber mensagens de WhatsApp sobre atividades importantes da conta e novidades.</div>
                    </div>
                    <Switch checked={whatsNotif} onCheckedChange={setWhatsNotif} />
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="font-semibold mb-2">Lembretes de Vencimento</div>
                    <label className="block text-sm mb-1">Dias de Antecedência</label>
                    <input type="number" min={0} max={30} value={daysBefore} onChange={e => setDaysBefore(Number(e.target.value))} className="border rounded px-2 py-1 w-16" />
                    <div className="text-xs text-gray-500 mt-1">Quantos dias antes do vencimento você quer ser lembrado (0 = no dia).</div>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-minhagrana-primary text-white">Salvar preferências</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
