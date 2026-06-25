'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useBranding } from '@/context/BrandingContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit2, Plus, Shield, Trash2, Palette, Sliders, AlertCircle, Upload, Settings } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

interface PositionData {
  id: number;
  name: string;
  label: string;
  color: string;
  canManageSettings: boolean;
  canExportLogs: boolean;
  canManageEvents: boolean;
  canManageProjects: boolean;
  isLeader: boolean;
}

export default function AdminSettingsPage() {
  const { user, token } = useAuth();
  const { settings: brandingSettings, updateSettings: updateBrandingContext } = useBranding();

  // Tab state
  const [activeTab, setActiveTab] = useState('branding');

  // Branding states
  const [appName, setAppName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f15a29');
  const [logoLightUrl, setLogoLightUrl] = useState('');
  const [logoDarkUrl, setLogoDarkUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

  // Positions states
  const [positions, setPositions] = useState<PositionData[]>([]);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionData | null>(null);

  // Modal form states
  const [posName, setPosName] = useState('');
  const [posLabel, setPosLabel] = useState('');
  const [posColor, setPosColor] = useState('');
  const [posCanManageSettings, setPosCanManageSettings] = useState(false);
  const [posCanExportLogs, setPosCanExportLogs] = useState(false);
  const [posCanManageEvents, setPosCanManageEvents] = useState(false);
  const [posCanManageProjects, setPosCanManageProjects] = useState(false);
  const [posIsLeader, setPosIsLeader] = useState(false);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // Check permissions
  const canAccess =
    user?.position === 'KORVEZETO' || user?.positionDetails?.canManageSettings === true;

  // Initialize branding form values
  useEffect(() => {
    if (brandingSettings) {
      setAppName(brandingSettings.appName);
      setPrimaryColor(brandingSettings.primaryColor);
      setLogoLightUrl(brandingSettings.logoLightUrl);
      setLogoDarkUrl(brandingSettings.logoDarkUrl);
      setFaviconUrl(brandingSettings.faviconUrl);
    }
  }, [brandingSettings]);

  // Fetch positions
  const fetchPositions = async () => {
    setIsLoadingPositions(true);
    try {
      const res = await fetch('/api/positions', { headers });
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      } else {
        toast.error('Nem sikerült betölteni a szerepköröket');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hiba történt a szerepkörök betöltésekor');
    } finally {
      setIsLoadingPositions(false);
    }
  };

  useEffect(() => {
    if (canAccess && token) {
      fetchPositions();
    }
  }, [canAccess, token]);

  if (!canAccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5 backdrop-blur-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4 text-red-500">
              <AlertCircle size={48} />
            </div>
            <CardTitle className="text-2xl text-red-500">Hozzáférés megtagadva</CardTitle>
            <CardDescription className="text-gray-400">
              Ez az oldal kizárólag a Körvezető és a rendszerbeállítások kezelésére jogosult szerepkörök számára érhető el.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.href = '/dashboard'}>Vissza a Dashboardra</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB to keep DB record size manageable)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A feltöltött kép nem lehet nagyobb 2MB-nál!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Branding Save
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          appName,
          primaryColor,
          logoLightUrl,
          logoDarkUrl,
          faviconUrl,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        updateBrandingContext(updated);
        toast.success('A kör arculati beállításai sikeresen elmentve!');
      } else {
        toast.error('Hiba történt a mentés során');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hálózati hiba történt a mentés során');
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingPosition(null);
    setPosName('');
    setPosLabel('');
    setPosColor('bg-slate-500/10 text-foreground border-slate-500/20');
    setPosCanManageSettings(false);
    setPosCanExportLogs(false);
    setPosCanManageEvents(false);
    setPosCanManageProjects(false);
    setPosIsLeader(false);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (pos: PositionData) => {
    setEditingPosition(pos);
    setPosName(pos.name);
    setPosLabel(pos.label);
    setPosColor(pos.color);
    setPosCanManageSettings(pos.canManageSettings);
    setPosCanExportLogs(pos.canExportLogs);
    setPosCanManageEvents(pos.canManageEvents);
    setPosCanManageProjects(pos.canManageProjects);
    setPosIsLeader(pos.isLeader);
    setIsModalOpen(true);
  };

  // Handle position save (Create / Update)
  const handleSavePosition = async () => {
    if (!posName || !posLabel || !posColor) {
      toast.error('Minden mező kitöltése kötelező!');
      return;
    }

    const payload = {
      name: posName,
      label: posLabel,
      color: posColor,
      canManageSettings: posIsLeader ? true : posCanManageSettings,
      canExportLogs: posIsLeader ? true : posCanExportLogs,
      canManageEvents: posIsLeader ? true : posCanManageEvents,
      canManageProjects: posIsLeader ? true : posCanManageProjects,
      isLeader: posIsLeader,
    };

    try {
      let res;
      if (editingPosition) {
        // Update
        res = await fetch(`/api/positions/${editingPosition.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Create
        res = await fetch('/api/positions', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingPosition ? 'Szerepkör sikeresen frissítve!' : 'Szerepkör sikeresen létrehozva!');
        setIsModalOpen(false);
        fetchPositions();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Hiba történt a mentés során');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hálózati hiba történt a mentés során');
    }
  };

  // Handle Delete Position
  const handleDeletePosition = async (id: number) => {
    if (!confirm('Biztosan törölni szeretnéd ezt a szerepkört? A művelet nem vonható vissza.')) {
      return;
    }

    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        toast.success('Szerepkör törölve!');
        fetchPositions();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || 'Nem sikerült törölni a szerepkört');
      }
    } catch (err) {
      console.error(err);
      toast.error('Hálózati hiba történt a törlés során');
    }
  };

  const presetColors = [
    { label: 'Szürke (Default)', class: 'bg-slate-500/10 text-foreground border-slate-500/20' },
    { label: 'Narancs (Kir-Dev)', class: 'bg-orange-500/10 text-foreground border-orange-500/20' },
    { label: 'Lila', class: 'bg-purple-500/10 text-foreground border-purple-500/20' },
    { label: 'Rózsaszín', class: 'bg-pink-500/10 text-foreground border-pink-500/20' },
    { label: 'Indigo', class: 'bg-indigo-500/10 text-foreground border-indigo-500/20' },
    { label: 'Zöld (Simonyi)', class: 'bg-emerald-500/10 text-foreground border-emerald-500/20' },
    { label: 'Sárga', class: 'bg-yellow-500/10 text-foreground border-yellow-500/20' },
    { label: 'Piros (Körvezető)', class: 'bg-red-500/10 text-foreground border-red-500/20' },
  ];

  return (
    <div className="p-4 md:p-0 md:pt-4 space-y-8 max-w-7xl mx-auto">
      <PageHeader
        title="Kör adminisztráció"
        description="Itt szabhatod személyre a kör arculatát, kezelheted a szerepköröket és jogosultságokat."
        icon={Settings}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 max-w-md bg-card border">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette size={16} /> Arculat
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Sliders size={16} /> Szerepkörök
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Branding */}
        <TabsContent value="branding">
          <form onSubmit={handleSaveBranding}>
            <Card className="bg-card/50 backdrop-blur-md border">
              <CardHeader>
                <CardTitle>Arculati beállítások</CardTitle>
                <CardDescription>
                  Módosíthatod a kör sajátos megjelenését. Mentés után a változások azonnal alkalmazásra kerülnek minden tagnál.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Alkalmazás / Kör neve</Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Pl. Semán Sprint Review"
                      className="bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Elsődleges szín</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-10 p-0 border-none cursor-pointer bg-transparent shrink-0"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#f15a29"
                        className="bg-background"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold border-b pb-2">Logók és ikonok</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="logoLight">Világos téma logó</Label>
                      <div className="flex flex-col gap-3">
                        {logoLightUrl ? (
                          <div className="relative h-28 w-full border border-border/80 rounded-xl p-3 flex items-center justify-center bg-zinc-950/10 shadow-inner group">
                            <img src={logoLightUrl} alt="Light logo preview" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-[1.02] duration-300" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg hover:scale-105 transition-transform"
                              onClick={() => setLogoLightUrl('')}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 rounded-xl p-6 cursor-pointer bg-background/50 hover:bg-accent/30 transition-all gap-2 group h-28">
                            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold">Kattints a logó feltöltéséhez</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Legfeljebb 2MB</p>
                            </div>
                            <input
                              id="logoLight"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, setLogoLightUrl)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logoDark">Sötét téma logó</Label>
                      <div className="flex flex-col gap-3">
                        {logoDarkUrl ? (
                          <div className="relative h-28 w-full border border-border/80 rounded-xl p-3 flex items-center justify-center bg-zinc-950/30 shadow-inner group">
                            <img src={logoDarkUrl} alt="Dark logo preview" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-[1.02] duration-300" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg hover:scale-105 transition-transform"
                              onClick={() => setLogoDarkUrl('')}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 rounded-xl p-6 cursor-pointer bg-background/50 hover:bg-accent/30 transition-all gap-2 group h-28">
                            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold">Kattints a logó feltöltéséhez</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Legfeljebb 2MB</p>
                            </div>
                            <input
                              id="logoDark"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, setLogoDarkUrl)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 col-span-1 md:col-span-2">
                      <Label htmlFor="favicon">Favicon ikon</Label>
                      <div className="flex flex-col gap-3">
                        {faviconUrl ? (
                          <div className="relative h-28 w-full border border-border/80 rounded-xl p-3 flex items-center justify-center bg-zinc-950/10 shadow-inner group">
                            <div className="relative h-16 w-16 p-1.5 border rounded-lg bg-zinc-950/20 flex items-center justify-center">
                              <img src={faviconUrl} alt="Favicon preview" className="max-h-full max-w-full object-contain" />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-lg hover:scale-105 transition-transform"
                              onClick={() => setFaviconUrl('')}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 rounded-xl p-6 cursor-pointer bg-background/50 hover:bg-accent/30 transition-all gap-2 group h-28">
                            <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                              <Upload className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-semibold">Kattints a favicon feltöltéséhez</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">Legfeljebb 2MB (1:1 javasolt)</p>
                            </div>
                            <input
                              id="favicon"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, setFaviconUrl)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-6 bg-card/20">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2 rounded-lg">
                  Változások mentése
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Tab 2: Roles & Positions */}
        <TabsContent value="roles">
          <Card className="bg-card/50 backdrop-blur-md border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Szerepkörök és Jogosultságok</CardTitle>
                <CardDescription>
                  Kezelheted a kör szerepköreit és hogy azok milyen funkciókhoz férhetnek hozzá.
                </CardDescription>
              </div>
              <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                <Plus size={16} /> Új szerepkör
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingPositions ? (
                <div className="py-8 text-center text-muted-foreground">Szerepkörök betöltése...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {positions.map((pos) => (
                    <Card key={pos.id} className="bg-background/50 border hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-2">
                          <Badge className={pos.color}>{pos.label}</Badge>
                          <span className="text-xs text-muted-foreground font-mono">({pos.name})</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(pos)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeletePosition(pos.id)}
                            disabled={pos.isLeader}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="text-xs space-y-2 text-muted-foreground">
                        {pos.isLeader ? (
                          <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
                            <Shield size={14} /> Szuper-adminisztrátor (Körvezető)
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Admin beállítások:</span>
                              <Badge variant={pos.canManageSettings ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                                {pos.canManageSettings ? 'Igen' : 'Nem'}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Naplók exportálása:</span>
                              <Badge variant={pos.canExportLogs ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                                {pos.canExportLogs ? 'Igen' : 'Nem'}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Események kezelése:</span>
                              <Badge variant={pos.canManageEvents ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                                {pos.canManageEvents ? 'Igen' : 'Nem'}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Projektek kezelése:</span>
                              <Badge variant={pos.canManageProjects ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                                {pos.canManageProjects ? 'Igen' : 'Nem'}
                              </Badge>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Position Form Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md w-full border bg-card/95 backdrop-blur-lg">
          <DialogHeader>
            <DialogTitle>{editingPosition ? 'Szerepkör szerkesztése' : 'Új szerepkör létrehozása'}</DialogTitle>
            <DialogDescription>
              Add meg a szerepkör alapvető adatait és engedélyeit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="posName">Azonosító név (uppercase)</Label>
                <Input
                  id="posName"
                  value={posName}
                  onChange={(e) => setPosName(e.target.value.toUpperCase())}
                  placeholder="Pl. PR_FELELOS"
                  disabled={!!editingPosition}
                  className="bg-background font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posLabel">Megjelenített név</Label>
                <Input
                  id="posLabel"
                  value={posLabel}
                  onChange={(e) => setPosLabel(e.target.value)}
                  placeholder="Pl. PR-felelős"
                  className="bg-background"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Stílus / Szín Badge minta</Label>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={posColor || 'bg-slate-500/10 text-foreground border-slate-500/20'}>
                  {posLabel || 'Előnézet'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto border p-2 rounded bg-background">
                {presetColors.map((color, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPosColor(color.class)}
                    className={`text-left text-xs p-1.5 rounded border border-transparent hover:border-border hover:bg-accent/50 ${
                      posColor === color.class ? 'bg-primary/10 border-primary/30 font-semibold' : ''
                    }`}
                  >
                    {color.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <Label className="text-sm font-semibold">Jogosultságok</Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="posIsLeader"
                  checked={posIsLeader}
                  onCheckedChange={(checked) => setPosIsLeader(!!checked)}
                  disabled={editingPosition?.isLeader}
                />
                <Label htmlFor="posIsLeader" className="text-sm font-medium cursor-pointer">
                  Körvezető (Teljes hozzáférés)
                </Label>
              </div>

              {!posIsLeader && (
                <div className="pl-6 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="posCanManageSettings"
                      checked={posCanManageSettings}
                      onCheckedChange={(checked) => setPosCanManageSettings(!!checked)}
                    />
                    <Label htmlFor="posCanManageSettings" className="text-sm font-normal cursor-pointer">
                      Rendszer arculatának és beállításainak szerkesztése
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="posCanExportLogs"
                      checked={posCanExportLogs}
                      onCheckedChange={(checked) => setPosCanExportLogs(!!checked)}
                    />
                    <Label htmlFor="posCanExportLogs" className="text-sm font-normal cursor-pointer">
                      Munkanaplók CSV exportálása
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="posCanManageEvents"
                      checked={posCanManageEvents}
                      onCheckedChange={(checked) => setPosCanManageEvents(!!checked)}
                    />
                    <Label htmlFor="posCanManageEvents" className="text-sm font-normal cursor-pointer">
                      Események létrehozása és szerkesztése
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="posCanManageProjects"
                      checked={posCanManageProjects}
                      onCheckedChange={(checked) => setPosCanManageProjects(!!checked)}
                    />
                    <Label htmlFor="posCanManageProjects" className="text-sm font-normal cursor-pointer">
                      Projektek, sprintek és feature-ök kezelése
                    </Label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Mégse</Button>
            <Button onClick={handleSavePosition}>Szerepkör mentése</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
