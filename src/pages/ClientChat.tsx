import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { authService, jobService } from "@/lib/supabaseService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Paperclip, Loader2, User, Download } from "lucide-react";

// Types need to be defined or imported
type Message = {
  id: string;
  created_at: string;
  sender_id: string;
  message_text: string | null;
  image_url: string | null;
  profiles: {
    full_name: string | null;
    profile_photo_url: string | null;
  } | null;
};

const ClientChatPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const user = await authService.getCurrentUser();
      setUserId(user?.id || null);

      if (jobId) {
        const { data, error } = await supabase
          .from("job_messages")
          .select(`
            *,
            profiles:sender_id (
              full_name,
              profile_photo_url
            )
          `)
          .eq("request_id", jobId)
          .order("created_at", { ascending: true });
        
        if (data) setMessages(data as unknown as Message[]);
        setLoading(false);
      }
    };
    init();

    const channel = supabase
      .channel(`job_chat_${jobId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'job_messages', filter: `request_id=eq.${jobId}` },
        (payload) => {
            supabase.from('job_messages').select('*, profiles:sender_id(full_name, profile_photo_url)').eq('id', payload.new.id).single().then(({data}) => {
                if(data) setMessages((prev) => [...prev, data as unknown as Message]);
            })
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);

  const handleSendMessage = async () => {
    if ((!newMessage && !file) || !userId || !jobId) return;

    setSending(true);

    let imageUrl: string | null = null;
    if (file) {
      const filePath = `${jobId}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('job-photos').upload(filePath, file);
      if (error) {
        console.error("Upload error:", error);
      } else {
        const { data: urlData } = supabase.storage.from('job-photos').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('job_messages').insert({
      request_id: jobId,
      sender_id: userId,
      message_text: newMessage || null,
      image_url: imageUrl,
    });

    if (!error) {
      setNewMessage("");
      setFile(null);
    }
    setSending(false);
  };

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-bounce"></div>
      </div>
      
      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="flex-shrink-0">
          <Link to="/clients" className="flex items-center gap-2 text-purple-300 hover:text-white mb-4 transition-colors">
              <ArrowLeft /> Back to Clients
          </Link>
        </div>
        
        <div className="flex-grow flex flex-col glass-card-deep overflow-hidden">
          {/* Chat Header (Optional) */}
          
          <div className="flex-grow flex flex-col-reverse p-4 gap-4 overflow-y-auto">
              {/* Messages will be mapped in reverse, so they start from the bottom */}
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-400" />
                </div>
              ) : (
                [...messages].reverse().map(msg => (
                  <div key={msg.id} className={`flex items-start gap-3 w-full ${msg.sender_id === userId ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-3 ${msg.sender_id === userId ? 'flex-row-reverse' : ''}`}>
                          <Avatar className="border-2 border-purple-400/50">
                              <AvatarImage src={msg.profiles?.profile_photo_url || ''} />
                              <AvatarFallback className="bg-purple-900/50"><User /></AvatarFallback>
                          </Avatar>
                          <div className={`p-3 rounded-lg max-w-md ${msg.sender_id === userId ? 'bg-purple-600' : 'bg-slate-700'}`}>
                              {msg.message_text && <p className="text-white">{msg.message_text}</p>}
                              {msg.image_url && (
                                  <div className="mt-2">
                                      <a href={msg.image_url} target="_blank" rel="noopener noreferrer" className="block relative group">
                                          <img src={msg.image_url} alt="Sent attachment" className="rounded-lg max-w-xs max-h-64 object-cover" />
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                              <Download className="text-white h-8 w-8" />
                                          </div>
                                      </a>
                                  </div>
                              )}
                              <p className="text-xs text-purple-200/70 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</p>
                          </div>
                      </div>
                  </div>
                ))
              )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-2 p-4 border-t border-white/10">
              <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow bg-slate-800/80 border-slate-600 text-white focus:ring-purple-500"
                  onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
              />
              <Button variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                  <Paperclip className="hover:text-purple-300" />
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <Button onClick={handleSendMessage} disabled={sending || (!newMessage && !file)}>
                  {sending ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientChatPage; 