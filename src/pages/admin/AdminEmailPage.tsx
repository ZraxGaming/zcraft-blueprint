// %%__NONCE_ADMIN_EMAIL_08_%%
// %%__VERSION_NUMBER_%%
// %%__BUILTBYBIT_%%

import { useState } from "react";
import { siteConfig } from "@/config/siteEnv";
import {
  Mail,
  Send,
  Copy,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { sendAdminEmail } from "@/services/emailService";

type EmailTemplate = "announcement" | "changelog" | "news" | "custom";
type RecipientType = "all_users" | "custom_list";

interface Template {
  id: EmailTemplate;
  name: string;
  description: string;
  subject: string;
  htmlTemplate: string;
}

const EMAIL_TEMPLATES: Template[] = [
  {
    id: "announcement",
    name: "General Announcement",
    description: "Send a general announcement to all users",
    subject: `Important Announcement from ${siteConfig.name}`,
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0;">📢 Announcement</h1>
  </div>
  <div style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
    <p style="color: #333; font-size: 16px; line-height: 1.6;">
      [Your announcement message here]
    </p>
    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 14px;">
        Join us on <a href="${siteConfig.url}" style="color: #667eea; text-decoration: none;">${siteConfig.domain}</a>
      </p>
    </div>
  </div>
</div>`,
  },
  {
    id: "changelog",
    name: "Changelog Notification",
    description: "Notify users about a new changelog/update",
    subject: "New Update Released - Check Our Latest Changelog",
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0;">🚀 New Update</h1>
  </div>
  <div style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">What's New?</h2>
    <p style="color: #666; font-size: 14px;">Check out the latest features and improvements:</p>
    <div style="background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0;">
      <p style="color: #333; margin: 0;">[Changelog details here]</p>
    </div>
    <div style="margin-top: 20px;">
      <a href="https://z-craft.xyz/events" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Read Full Changelog</a>
    </div>
  </div>
</div>`,
  },
  {
    id: "news",
    name: "News Notification",
    description: "Share a news article with your community",
    subject: "Latest News from ZCraft Network",
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
    <h1 style="margin: 0;">📰 News Update</h1>
  </div>
  <div style="padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">[Article Title]</h2>
    <p style="color: #666; font-size: 14px; line-height: 1.6;">
      [Article summary or excerpt]
    </p>
    <div style="margin-top: 20px;">
      <a href="https://z-craft.xyz/news" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Read More</a>
    </div>
  </div>
</div>`,
  },
  {
    id: "custom",
    name: "Custom Email",
    description: "Create a fully custom email",
    subject: "Message from ZCraft Network",
    htmlTemplate: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="padding: 30px; background-color: #f9f9f9;">
    <p style="color: #333; font-size: 16px; line-height: 1.6;">
      [Your custom HTML content here]
    </p>
  </div>
</div>`,
  },
];

export default function AdminEmailPage() {
  const { session } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>("announcement");
  const [subject, setSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [htmlContent, setHtmlContent] = useState(EMAIL_TEMPLATES[0].htmlTemplate);
  const [recipientType, setRecipientType] = useState<RecipientType>("all_users");
  const [customEmails, setCustomEmails] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (templateId: EmailTemplate) => {
    setSelectedTemplate(templateId);
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setHtmlContent(template.htmlTemplate);
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(htmlContent);
    toast({
      title: "Copied",
      description: "HTML template copied to clipboard",
    });
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email subject",
        variant: "destructive",
      });
      return;
    }

    if (!htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter email content",
        variant: "destructive",
      });
      return;
    }

    if (recipientType === "custom_list" && !customEmails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    if (!session?.access_token) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      setSending(true);

      const emailList =
        recipientType === "custom_list"
          ? customEmails
              .split(",")
              .map((e) => e.trim())
              .filter((e) => e.length > 0)
          : undefined;

      await sendAdminEmail({
        subject,
        html: htmlContent,
        accessToken: session.access_token,
        emails: emailList,
        audience: recipientType === "all_users" ? "all_users" : "manual",
      });

      toast({
        title: "Success",
        description: `Email sent to ${recipientType === "all_users" ? "all users" : emailList?.length + " recipient(s)"}`,
      });

      // Reset form
      setSubject("");
      setHtmlContent("");
      setRecipientType("all_users");
      setCustomEmails("");
      setSelectedTemplate("announcement");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout title="Email Management">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email Templates
              </CardTitle>
              <CardDescription>Select a template to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {EMAIL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateChange(template.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTemplate === template.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm opacity-75">{template.description}</div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Email Composer */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Customize your email content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="content">HTML Content *</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyTemplate}
                    className="gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy HTML
                  </Button>
                </div>
                <Textarea
                  id="content"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Enter HTML content..."
                  rows={12}
                  className="w-full font-mono text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="gap-2"
                >
                  {showPreview ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Hide Preview
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Preview Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-lg p-6 bg-white"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </CardContent>
          </Card>
        )}

        {/* Recipients and Send */}
        <Card>
          <CardHeader>
            <CardTitle>Recipients & Send</CardTitle>
            <CardDescription>Choose who to send this email to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-type">Send To</Label>
              <Select value={recipientType} onValueChange={(value) => setRecipientType(value as RecipientType)}>
                <SelectTrigger id="recipient-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_users">
                    All Users <span className="text-xs text-muted-foreground ml-2">(Recommended)</span>
                  </SelectItem>
                  <SelectItem value="custom_list">Custom Email List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recipientType === "custom_list" && (
              <div className="space-y-2">
                <Label htmlFor="emails">Email Addresses</Label>
                <Textarea
                  id="emails"
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  placeholder="Enter email addresses separated by commas&#10;example@email.com, another@email.com"
                  rows={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple emails with commas. Found{" "}
                  <span className="font-semibold">
                    {customEmails.split(",").filter((e) => e.trim().length > 0).length}
                  </span>{" "}
                  email(s).
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSubject("");
                  setHtmlContent("");
                  setRecipientType("all_users");
                  setCustomEmails("");
                  setSelectedTemplate("announcement");
                }}
                disabled={sending}
              >
                Clear Form
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={sending || !subject.trim() || !htmlContent.trim()}
                className="btn-primary-gradient gap-2"
              >
                {sending ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">💡 Tips</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Use the preloaded templates to get started quickly</p>
            <p>• Edit the HTML directly for advanced customization</p>
            <p>• Copy the template HTML to use in external tools</p>
            <p>• Always preview your email before sending to all users</p>
            <p>
              • Email delivery respects user preferences for opt-in categories (marketing, recruitment)
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
