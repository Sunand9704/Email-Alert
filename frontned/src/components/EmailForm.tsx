import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Plus, Users, AlertCircle, Loader2, Calendar, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getEmails, addEmail } from "./api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface EmailData {
  _id: string;
  tempEmail: string;
  primaryEmail: string;
  alertDate: string;
  createdAt: string;
}

const EmailForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    tempEmail: "",
    primaryEmail: "",
    alertDate: "",
  });
  const [validationError, setValidationError] = useState("");
  const queryClient = useQueryClient();

  const { data: emails = [], isLoading: isLoadingEmails } = useQuery({
    queryKey: ["emails"],
    queryFn: getEmails,
  });

  const addEmailMutation = useMutation({
    mutationFn: addEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails"] });
      setFormData({ tempEmail: "", primaryEmail: "", alertDate: "" });
      setValidationError("");
      setIsOpen(false);
      toast.success("Email alert scheduled!");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Failed to schedule alert";
      setValidationError(msg);
      toast.error(msg);
    },
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.tempEmail || !formData.primaryEmail || !formData.alertDate) {
      return setValidationError("All fields are required");
    }

    if (!validateEmail(formData.tempEmail)) {
      return setValidationError("Invalid temporary email");
    }

    if (!validateEmail(formData.primaryEmail)) {
      return setValidationError("Invalid primary email");
    }

    const selectedDate = new Date(formData.alertDate);
    if (selectedDate <= new Date()) {
      return setValidationError("Alert date must be in the future");
    }

    addEmailMutation.mutate({
      tempEmail: formData.tempEmail.trim().toLowerCase(),
      primaryEmail: formData.primaryEmail.trim().toLowerCase(),
      alertDate: formData.alertDate,
    });
  };

  const isSubmitting = addEmailMutation.isPending;

  return (
    <div className="w-full max-w-lg mx-auto p-8 rounded-3xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="relative inline-flex mb-2">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Email Alerts
          </h1>
          <p className="text-muted-foreground font-medium">
            Automated notifications, delivered precisely.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95 group">
              <Plus className="w-6 h-6 mr-2 transition-transform group-hover:rotate-90" />
              <span className="text-lg font-bold">Add Email Alert</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-white/20 bg-background/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Schedule New Alert</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">
                Enter emails and the date you want the revocation alert to be sent.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tempEmail" className="text-sm font-bold ml-1">Temporary Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="tempEmail"
                      type="email"
                      placeholder="temp@example.com"
                      className="pl-10 h-12 rounded-xl focus:ring-primary/20"
                      value={formData.tempEmail}
                      onChange={(e) => setFormData({ ...formData, tempEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryEmail" className="text-sm font-bold ml-1">Primary Email</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="primaryEmail"
                      type="email"
                      placeholder="primary@example.com"
                      className="pl-10 h-12 rounded-xl focus:ring-primary/20"
                      value={formData.primaryEmail}
                      onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alertDate" className="text-sm font-bold ml-1">Alert Date & Time</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="alertDate"
                      type="datetime-local"
                      className="pl-10 h-12 rounded-xl focus:ring-primary/20"
                      value={formData.alertDate}
                      onChange={(e) => setFormData({ ...formData, alertDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="flex items-center gap-2 text-destructive text-sm font-bold px-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationError}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all duration-300"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Schedule Alert"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground/80 lowercase tracking-wider">
            <Users className="w-4 h-4 text-primary" />
            <span>Active Alerts</span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
            {emails.length} Scheduled
          </span>
        </div>

        {isLoadingEmails ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground font-medium animate-pulse">Fetching alerts...</p>
          </div>
        ) : emails.length > 0 ? (
          <div className="grid gap-3">
            {emails.map((emailObj: EmailData, index: number) => {
              const targetDate = new Date(emailObj.alertDate);
              const now = new Date();
              const diffTime = targetDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const isToday = targetDate.toDateString() === now.toDateString();

              return (
                <div
                  key={emailObj._id}
                  className="group relative flex items-center gap-4 p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:border-primary/30 hover:shadow-xl transition-all duration-500 animate-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary text-sm font-bold border border-primary/5 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-foreground truncate">{emailObj.tempEmail}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-amber-500' : 'bg-primary'} animate-pulse`} />
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight truncate">
                        Alert to: <span className="text-foreground/70">{emailObj.primaryEmail}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-black text-primary uppercase tracking-wider">
                      {isToday ? "Today" : `${diffDays}d left`}
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                      {targetDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 rounded-3xl border-2 border-dashed border-primary/10 bg-primary/5 animate-in zoom-in duration-700">
            <div className="p-4 rounded-full bg-white/50 backdrop-blur-lg">
              <Mail className="w-8 h-8 text-primary/40" />
            </div>
            <div className="max-w-[200px]">
              <p className="text-sm font-bold text-foreground">No alerts scheduled</p>
              <p className="text-xs text-muted-foreground">Click the button above to schedule your first revocation alert.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailForm;
