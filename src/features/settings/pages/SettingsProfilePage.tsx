import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/utils/utils";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/services/userApi";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Toast = { id: string; message: string };

function ToastBar({
  toast,
  onClose,
}: {
  toast: Toast | null;
  onClose: () => void;
}) {
  if (!toast) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-lg border border-[#EEE7DF] bg-white p-3 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-foreground">
          {toast.message}
        </div>
        <Button size="sm" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>
    </motion.div>
  );
}

export default function SettingsProfilePage() {
  const [toast, setToast] = useState<Toast | null>(null);
  const { data: profileData, isLoading } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (profileData?.data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile({
        name: profileData.data.name || "",
        email: profileData.data.email || "",
        phone: profileData.data.phone || "",
      });
      if (profileData.data.profileImage && !selectedImage) {
        setImagePreview(profileData.data.profileImage);
      }
    }
  }, [profileData, selectedImage]);

  function showToast(message: string) {
    const id = String(Date.now());
    setToast({ id, message });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2500);
  }

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("phone", profile.phone);
      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      await updateProfile(formData).unwrap();
      showToast("Profile updated");
    } catch {
      showToast("Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <PageShell title="Settings" description="Profile settings.">
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          Loading profile...
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Settings" description="Profile settings.">
      <div className="space-y-4">
        <AnimatePresence>
          <ToastBar toast={toast} onClose={() => setToast(null)} />
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                    <AvatarImage
                      src={getImageUrl(imagePreview || undefined)}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl">
                      {profile.name.substring(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border border-[#EEE7DF] bg-white text-muted-foreground shadow-sm hover:text-foreground transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium">Profile Picture</div>
                  <div className="text-xs text-muted-foreground">
                    Click the camera icon to update your photo
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium">Admin name</div>
                  <Input
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium">Email</div>
                  <Input
                    value={profile.email}
                    disabled
                    className="opacity-70 bg-gray-50"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <div className="text-sm font-medium">Phone</div>
                  <Input
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="+880…"
                  />
                </div>
              </div>

              <motion.div
                whileHover={isUpdating ? {} : { scale: 1.03 }}
                whileTap={isUpdating ? {} : { scale: 0.97 }}
                className="inline-block"
              >
                <Button onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
}
