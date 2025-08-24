"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, RefreshCw } from "lucide-react";
import { useAlert } from "@/hooks/use-alert";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  enableVideoCalls: boolean;
  maintenanceMode: boolean;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "E-Learning Management System",
    siteDescription: "A comprehensive platform for online education",
    adminEmail: "admin@example.com",
    maxFileSize: 50,
    allowedFileTypes: ["pdf", "doc", "docx", "ppt", "pptx", "txt", "jpg", "jpeg", "png", "gif", "mp4", "mp3"],
    enableVideoCalls: true,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAlert();

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        showSuccess("Settings Saved", "System settings have been updated successfully");
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to save settings");
      }
    } catch (error) {
      showError("Error", "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch("/api/settings/reset", {
        method: "POST",
      });

      if (response.ok) {
        const defaultSettings = await response.json();
        setSettings(defaultSettings);
        showSuccess("Settings Reset", "Settings have been reset to default values");
      } else {
        const error = await response.json();
        showError("Error", error.error || "Failed to reset settings");
      }
    } catch (error) {
      showError("Error", "Failed to reset settings");
    }
  };

  return (
    <DashboardLayout userRole="admin" userName={user?.name || "Admin"}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure system settings and preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="files">File Upload</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic information about your e-learning system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  placeholder="Enter site name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  placeholder="Enter site description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>File Upload Settings</CardTitle>
              <CardDescription>
                Configure file upload restrictions and allowed types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">Maximum File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  min="1"
                  max="500"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) || 50 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                <Textarea
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes.join(", ")}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    allowedFileTypes: e.target.value.split(",").map(type => type.trim()).filter(Boolean)
                  })}
                  placeholder="pdf, doc, docx, ppt, pptx, txt, jpg, jpeg, png, gif, mp4, mp3"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Enter file extensions separated by commas
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Settings</CardTitle>
              <CardDescription>
                Enable or disable system features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Video Calls</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable video call functionality for teachers and students
                  </p>
                </div>
                <Switch
                  checked={settings.enableVideoCalls}
                  onCheckedChange={(checked) => setSettings({ ...settings, enableVideoCalls: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                System-wide configuration options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the system in maintenance mode (only admins can access)
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </DashboardLayout>
  );
}