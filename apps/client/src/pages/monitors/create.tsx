import { useNavigate } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import { MonitorForm } from "@/components/monitors/monitor-form";
import { Button } from "@/components/ui/button";

export function CreateMonitorPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="flex items-start gap-4 pt-6 pb-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl max-w-sm">
          Create Monitor to keep an eye on your website's uptime and
          performance.
        </h1>
      </div>
      <div className="mx-12">
        <MonitorForm onSuccess={() => navigate("/dashboard")} />
      </div>
    </div>
  );
}
