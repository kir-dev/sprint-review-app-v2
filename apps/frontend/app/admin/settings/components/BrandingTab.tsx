'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useBranding } from '@/context/BrandingContext';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';

export function BrandingTab() {
  const { token } = useAuth();
  const { settings: brandingSettings, updateSettings: updateBrandingContext } = useBranding();

  // Branding states
  const [appName, setAppName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#f15a29');
  const [logoLightUrl, setLogoLightUrl] = useState('');
  const [logoDarkUrl, setLogoDarkUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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

  return (
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
              <ColorPicker value={primaryColor} onChange={setPrimaryColor} />
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
  );
}
