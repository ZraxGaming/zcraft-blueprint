import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MessageSquare, ThumbsUp, Flag, Share2, User, Loader, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { forumService, ForumPost } from "@/services/forumService";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Reply {
  id: string;
  author_id: string;
  author?: { username: string; avatar_url: string | null };
  content: string;
  created_at: string;
  is_staff: boolean;
  likes: number;
}

interface PostLikes {
  [postId: string]: boolean;
}

interface ReplyLikes {
  [replyId: string]: boolean;
}

export default function ForumThreadPage() {
  const { slug, threadId } = useParams<{ slug: string; threadId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [postLikes, setPostLikes] = useState<PostLikes>({});
  const [replyLikes, setReplyLikes] = useState<ReplyLikes>({});
  const [postLikeCount, setPostLikeCount] = useState(0);
  const [replyLikeCounts, setReplyLikeCounts] = useState<{ [replyId: string]: number }>({});

  useEffect(() => {
    loadPost();
  }, [threadId, slug]);

  const loadPost = async () => {
    try {
      if (!threadId) {
        navigate(`/forums/${slug}`);
        return;
      }

      const postData = await forumService.getForumPostById(threadId);
      setPost(postData);

      // Load likes for post
      try {
        const postLikesData = await forumService.getForumPostLikes(threadId);
        const postLikedByUser = user ? postLikesData.includes(user.id) : false;
        setPostLikes({ [threadId]: postLikedByUser });
        setPostLikeCount(postLikesData.length);
      } catch (err) {
        console.warn('Failed to load post likes:', err);
      }

      // Load replies
      const { data: repliesData } = await supabase
        .from("forum_replies")
        .select("*, author:users!forum_replies_author_id_fkey(id, username, avatar_url)")
        .eq("post_id", threadId)
        .order("created_at", { ascending: true });

      setReplies((repliesData || []) as Reply[]);

      // Load likes for each reply
      if (repliesData && repliesData.length > 0) {
        const replyLikeData: ReplyLikes = {};
        const replyLikeCountData: { [replyId: string]: number } = {};

        for (const reply of repliesData) {
          try {
            const replyLikes = await forumService.getForumReplyLikes(reply.id);
            replyLikeCountData[reply.id] = replyLikes.length;
            replyLikeData[reply.id] = user ? replyLikes.includes(user.id) : false;
          } catch (err) {
            console.warn(`Failed to load likes for reply ${reply.id}:`, err);
            replyLikeCountData[reply.id] = 0;
            replyLikeData[reply.id] = false;
          }
        }

        setReplyLikeCounts(replyLikeCountData);
        setReplyLikes(replyLikeData);
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to load post",
        variant: "destructive",
      });
      navigate(`/forums/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to reply.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!post) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          post_id: post.id,
          author_id: user.id,
          content: replyContent,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your reply has been posted!",
      });

      setReplyContent("");
      loadPost();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to post reply",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikePost = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like posts.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!post) return;

    try {
      const isLiked = postLikes[post.id];
      
      if (isLiked) {
        await forumService.unlikeForumPost(post.id, user.id);
        setPostLikes({ ...postLikes, [post.id]: false });
        setPostLikeCount(Math.max(0, postLikeCount - 1));
      } else {
        await forumService.likeForumPost(post.id, user.id);
        setPostLikes({ ...postLikes, [post.id]: true });
        setPostLikeCount(postLikeCount + 1);
      }

      toast({
        title: "Success",
        description: isLiked ? "Post unliked" : "Post liked!",
      });
    } catch (err: any) {
      console.error('Like error:', err);
      toast({
        title: "Error",
        description: err?.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like replies.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      const isLiked = replyLikes[replyId];

      if (isLiked) {
        await forumService.unlikeForumReply(replyId, user.id);
        setReplyLikes({ ...replyLikes, [replyId]: false });
        setReplyLikeCounts({ ...replyLikeCounts, [replyId]: Math.max(0, (replyLikeCounts[replyId] || 0) - 1) });
      } else {
        await forumService.likeForumReply(replyId, user.id);
        setReplyLikes({ ...replyLikes, [replyId]: true });
        setReplyLikeCounts({ ...replyLikeCounts, [replyId]: (replyLikeCounts[replyId] || 0) + 1 });
      }

      toast({
        title: "Success",
        description: isLiked ? "Reply unliked" : "Reply liked!",
      });
    } catch (err: any) {
      console.error('Like error:', err);
      toast({
        title: "Error",
        description: err?.message || "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const handleSharePost = async () => {
    const shareUrl = `https://z-craft.xyz/forums/${slug}/${post?.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.title,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Share error:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Success",
          description: "Post link copied to clipboard!",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user) return;

    if (!confirm("Are you sure you want to delete this reply?")) return;

    try {
      await forumService.deleteForumReply(replyId);
      setReplies(replies.filter(r => r.id !== replyId));
      toast({
        title: "Success",
        description: "Reply deleted successfully",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete reply",
        variant: "destructive",
      });
    }
  };

  const handleReportPost = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to report posts.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const reason = prompt("Please describe why you're reporting this post:");
    if (!reason || !reason.trim()) {
      toast({
        title: "Report cancelled",
        description: "No reason provided",
      });
      return;
    }

    try {
      // Store report in localStorage as a simple implementation
      const reportsKey = "forum_post_reports";
      const reports = JSON.parse(localStorage.getItem(reportsKey) || "[]");
      reports.push({
        postId: post?.id,
        reportedBy: user.id,
        reason,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(reportsKey, JSON.stringify(reports));

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our forums safe!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  const handleReportReply = async (replyId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to report replies.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const reason = prompt("Please describe why you're reporting this reply:");
    if (!reason || !reason.trim()) {
      toast({
        title: "Report cancelled",
        description: "No reason provided",
      });
      return;
    }

    try {
      // Store report in localStorage as a simple implementation
      const reportsKey = "forum_reply_reports";
      const reports = JSON.parse(localStorage.getItem(reportsKey) || "[]");
      reports.push({
        replyId,
        reportedBy: user.id,
        reason,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(reportsKey, JSON.stringify(reports));

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our forums safe!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to submit report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <Loader className="animate-spin h-8 w-8 text-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">Post not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout seo={{
      title: `${post.title} — ZCraft Network Forums Discussion`,
      description: `${post.content.substring(0, 160)}... Join the discussion on ZCraft Network forums about Minecraft lifesteal SMP gameplay, server updates, and community topics.`,
      keywords: `zcraft forums, ${post.title}, minecraft discussion, lifesteal forums, server discussion, community forum, ${slug}, forum thread`,
      url: `/forums/${slug}/${post.id}`,
      type: "article",
      publishedTime: post.created_at,
      section: "Forums",
      tags: ["forums", "discussion", "minecraft", "community", "lifesteal"]
    }}>
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link
              to={`/forums/${slug}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forum
            </Link>

            {/* Post Header */}
            <Card className="border-0 bg-card mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">{slug}</Badge>
                    <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                      {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author?.username || "Unknown"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(post.created_at || "").toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {replies.length} replies
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Original Post */}
            <Card className="border-0 bg-card mb-4">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="shrink-0 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold text-sm">{post.author?.username || "Unknown"}</p>
                    <Badge variant="secondary" className="text-xs mt-1">OP</Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`gap-1 ${postLikes[post.id] ? 'text-primary' : ''}`}
                        onClick={handleLikePost}
                        aria-label={postLikes[post.id] ? "Unlike this post" : "Like this post"}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {postLikeCount}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1"
                        onClick={handleSharePost}
                        aria-label="Share this post"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 text-muted-foreground"
                        onClick={handleReportPost}
                        aria-label="Report this post"
                      >
                        <Flag className="h-4 w-4" />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Replies */}
            <div className="space-y-4 mb-8">
              {replies.map((reply) => (
                <Card
                  key={reply.id}
                  className={`border-0 ${
                    reply.is_staff ? "bg-primary/5 border-l-2 border-primary" : "bg-card"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="shrink-0 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-xl mb-2">
                          <User className="h-6 w-6" />
                        </div>
                        <p className="font-semibold text-sm">
                          {reply.author?.username || "Unknown"}
                        </p>
                        {reply.is_staff && (
                          <Badge className="text-xs mt-1 bg-blue-500">Staff</Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">
                          {new Date(reply.created_at).toLocaleString()}
                        </p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`gap-1 ${replyLikes[reply.id] ? 'text-primary' : ''}`}
                            onClick={() => handleLikeReply(reply.id)}
                            aria-label={replyLikes[reply.id] ? "Unlike this reply" : "Like this reply"}
                          >
                            <ThumbsUp className="h-4 w-4" />
                            {replyLikeCounts[reply.id] || 0}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-muted-foreground"
                            onClick={() => handleReportReply(reply.id)}
                            aria-label="Report this reply"
                          >
                            <Flag className="h-4 w-4" />
                            Report
                          </Button>
                          {user && user.id === reply.author_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteReply(reply.id)}
                              aria-label="Delete your reply"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reply Box */}
            <Card className="border-0 bg-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Post a Reply</h3>
                {!user ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">Please log in to reply</p>
                    <Button onClick={() => navigate("/login")}>Login</Button>
                  </div>
                ) : (
                  <>
                    <Textarea
                      placeholder="Write your reply..."
                      className="min-h-32 mb-4"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <Button
                      onClick={handleReply}
                      disabled={submitting}
                      className="btn-primary-gradient"
                    >
                      {submitting ? "Posting..." : "Submit Reply"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
}
