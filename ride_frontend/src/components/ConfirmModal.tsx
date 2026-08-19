import { useEffect, useState } from "react";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import Button from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = true,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          if (!loading) onClose();
        }}
      />

      {/* Modal Card */}
      <div
        className="relative z-10 w-full max-w-md glass-strong rounded-2xl border border-white/80 p-6 md:p-7 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: "0 25px 60px rgba(46, 123, 255, 0.2), 0 10px 25px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-full text-ink-variant/60 hover:text-ink hover:bg-ink/5 transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-danger/10 text-danger border border-danger/20"
                : "bg-primary/10 text-primary border border-primary/20"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 pt-1">
            <h3 className="font-display text-lg font-bold text-ink">
              {title}
            </h3>
            <p className="text-sm text-ink-variant leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center font-medium rounded-md px-4 py-2 text-sm transition-all focus:outline-none disabled:opacity-50 ${
              isDanger
                ? "bg-danger hover:bg-danger/90 text-white shadow-md shadow-danger/25"
                : "bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/25"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
