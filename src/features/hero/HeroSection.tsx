import { useMemo, useState } from "react";
import { ImagePlus } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type HeroType = "shop" | "service";

export default function HeroSection() {
  const [title, setTitle] = useState("Fresh Food Delivered");
  const [description, setDescription] = useState(
    "Fast delivery at your doorstep.",
  );

  const [image, setImage] = useState<string | null>(null);

  const [heroType, setHeroType] = useState<HeroType>("shop");

  const buttonText = useMemo(() => {
    return heroType === "shop" ? "Shop Now" : "Go To Service";
  }, [heroType]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setImage(url);
  };

  return (
    <PageShell title="Hero Section" description="Manage homepage hero content.">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* Form */}
        <Card className="border-[#EEE7DF] shadow-soft">
          <CardHeader>
            <CardTitle>Update Hero</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Header</label>

              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className=" w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Hero Type
              </label>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={heroType === "shop" ? "default" : "outline"}
                  onClick={() => setHeroType("shop")}
                >
                  Shop
                </Button>

                <Button
                  type="button"
                  variant={heroType === "service" ? "default" : "outline"}
                  onClick={() => setHeroType("service")}
                >
                  Service
                </Button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Upload Image
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                <ImagePlus />
                Select Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleUpload}
                />
              </label>
            </div>

            <Button className="w-full">Save Hero</Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="relative h-125 overflow-hidden rounded-3xl">
              {image ? (
                <img
                  src={image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="h-full bg-[#F7F5F2]" />
              )}

              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute left-10 top-1/2 max-w-lg -translate-y-1/2 text-white">
                <h1 className="text-5xl font-bold">{title}</h1>

                <p className="mt-4">{description}</p>

                <Button className="mt-6 bg-white text-black">
                  {buttonText}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
