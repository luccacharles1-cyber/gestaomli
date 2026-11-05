import { useState } from "react";
import { toast } from "sonner";
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { commercialDescription, type Device } from "@/lib/devices";
import { formatBRL } from "@/lib/money";

type Photo = { id: string; url: string; path: string };

/** Shares ONLY the real photos (plus optional commercial text). Never cost, supplier or internal notes. */
export function ShareDialog({ device, photos }: { device: Device; photos: Photo[] }) {
  const [selected, setSelected] = useState<string[]>(() => photos.map((p) => p.id));
  const [withText, setWithText] = useState(true);
  const [withPrice, setWithPrice] = useState(false);
  const [busy, setBusy] = useState(false);

  const text = commercialDescription(device, withPrice, formatBRL);

  async function loadFiles(): Promise<File[]> {
    const chosen = photos.filter((p) => selected.includes(p.id));
    return Promise.all(
      chosen.map(async (p, i) => {
        const res = await fetch(p.url);
        const blob = await res.blob();
        const ext = (blob.type.split("/")[1] || "jpg").replace("jpeg", "jpg");
        return new File([blob], `${device.model.replace(/\s+/g, "-")}-${i + 1}.${ext}`, { type: blob.type || "image/jpeg" });
      }),
    );
  }

  async function share() {
    if (!selected.length) { toast.error("Selecione ao menos uma foto."); return; }
    setBusy(true);
    try {
      const files = await loadFiles();
      const data: ShareData = { files, ...(withText ? { text } : {}) };
      if (navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
      } else {
        toast.info("Este navegador não permite compartilhar arquivos. Baixando as fotos.");
        download(files);
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) toast.error("Não foi possível compartilhar.");
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll() {
    if (!selected.length) { toast.error("Selecione ao menos uma foto."); return; }
    setBusy(true);
    try {
      download(await loadFiles());
      if (withText) await navigator.clipboard?.writeText(text).then(() => toast.success("Descrição copiada."), () => undefined);
    } finally {
      setBusy(false);
    }
  }

  function download(files: File[]) {
    for (const f of files) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(f);
      a.download = f.name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!photos.length}><Share2 className="mr-1 h-4 w-4" />Compartilhar fotos</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compartilhar fotos</DialogTitle>
          <DialogDescription>Somente as fotos selecionadas são enviadas. Custos e dados internos nunca saem.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                className={`relative aspect-square overflow-hidden rounded-md border-2 ${on ? "border-gold" : "border-transparent opacity-50"}`}
              >
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={withText} onCheckedChange={(v) => setWithText(v === true)} />Incluir descrição comercial</label>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={withPrice} disabled={!withText} onCheckedChange={(v) => setWithPrice(v === true)} />Incluir preço</label>
        {withText && <p className="rounded-md bg-muted p-3 text-sm">{text}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={downloadAll} disabled={busy}><Download className="mr-1 h-4 w-4" />Baixar</Button>
          <Button onClick={share} disabled={busy}><Share2 className="mr-1 h-4 w-4" />{busy ? "Preparando…" : "Compartilhar"}</Button>
        </div>
        <p className="text-xs text-muted-foreground">No celular, escolha o WhatsApp na lista do compartilhamento.</p>
      </DialogContent>
    </Dialog>
  );
}
