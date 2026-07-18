import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChangePasswordMutation } from "@/services/authApi";

type Toast = { id: string; message: string; type: "success" | "error" };

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
      className={`rounded-lg border p-3 shadow-soft ${
        toast.type === "error"
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-green-200 bg-green-50 text-green-600"
      }`}
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

export default function SettingsSecurityPage() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [show, setShow] = useState(false);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validation = useMemo(() => {
    const minLen = form.newPassword.length >= 6;
    const match =
      form.newPassword.length > 0 &&
      form.confirmPassword.length > 0 &&
      form.newPassword === form.confirmPassword;
    return { minLen, match };
  }, [form.confirmPassword, form.newPassword]);

  function showToast(message: string, type: "success" | "error" = "success") {
    const id = String(Date.now());
    setToast({ id, message, type });
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4000);
  }

  async function onUpdate() {
    if (!validation.minLen || !validation.match) return;
    try {
      const result = await changePassword(form).unwrap();
      showToast(result.message || "Password changed successfully", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast(
        err?.data?.message || err?.message || "Failed to update password",
        "error",
      );
    }
  }

  return (
    <PageShell title="Settings" description="Security settings.">
      <div className="space-y-4 max-w-xl">
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
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">Current password</div>
                <div className="flex gap-2">
                  <Input
                    type={show ? "text" : "password"}
                    value={form.currentPassword}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">New password</div>
                <Input
                  type={show ? "text" : "password"}
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, newPassword: e.target.value }))
                  }
                />
                <div className="text-xs text-muted-foreground">
                  Min 6 chars{" "}
                  {validation.minLen ? (
                    <Badge variant="success">ok</Badge>
                  ) : (
                    <Badge variant="warning">needs 6+</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Confirm password</div>
                <Input
                  type={show ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                  }
                />
                <div className="text-xs text-muted-foreground">
                  Match{" "}
                  {validation.match ? (
                    <Badge variant="success">matched</Badge>
                  ) : (
                    <Badge variant="warning">not matched</Badge>
                  )}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Button
                  onClick={onUpdate}
                  disabled={
                    !validation.minLen || !validation.match || isLoading
                  }
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </PageShell>
  );
}
