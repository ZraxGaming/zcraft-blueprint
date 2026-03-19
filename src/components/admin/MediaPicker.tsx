import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/ImageUpload";
import {
  listBucketImages,
  StoredImage,
  uploadChangelogImage,
  uploadNewsImage,
} from "@/services/storageService";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface MediaPickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  kind: "news" | "changelog" | "site";
  identifier: string;
}

export function MediaPicker({ label = "Image", value, onChange, kind, identifier }: MediaPickerProps) {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualUrl, setManualUrl] = useState(value);

  useEffect(() => {
    setManualUrl(value);
  }, [value]);

  const prefixes = useMemo(() => {
    if (kind === "news") return ["news", "site"];
    if (kind === "changelog") return ["changelogs", "site"];
    return ["site", "news", "changelogs"];
  }, [kind]);

  const loadImages = async () => {
    setLoading(true);
    const bucketImages = await listBucketImages("imgs", prefixes);
    setImages(bucketImages);
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, [kind]);

  const handleUpload = async (file: File) => {
    const safeIdentifier = identifier?.trim() || `${kind}-asset`;
    const result =
      kind === "changelog"
        ? await uploadChangelogImage(file, safeIdentifier)
        : await uploadNewsImage(file, safeIdentifier);

    if (result.error) {
      throw new Error(result.error);
    }

    onChange(result.url);
    await loadImages();
    return result.url;
  };

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{label}</CardTitle>
          <Button variant="outline" size="sm" onClick={loadImages} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {value && (
          <div className="rounded-xl overflow-hidden border border-border bg-muted/20">
            <img src={value} alt="Selected media" className="w-full h-48 object-cover" />
          </div>
        )}

        <Tabs defaultValue="library" className="space-y-4">
          <TabsList>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="manual">Manual URL</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-3">
            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground">No images found in the selected `imgs` folders yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((image) => (
                  <button
                    type="button"
                    key={image.path}
                    onClick={() => onChange(image.url)}
                    className={`rounded-xl border overflow-hidden text-left transition-colors ${
                      value === image.url ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <img src={image.url} alt={image.name} className="w-full h-24 object-cover" />
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{image.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{image.path}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-3">
            <ImageUpload
              onUpload={handleUpload}
              preview={value}
              label={`Upload ${kind} image`}
              maxSize={5}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-3">
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                onChange(manualUrl.trim());
                toast({ title: "Image selected", description: "Manual image URL applied." });
              }}
            >
              Use URL
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
