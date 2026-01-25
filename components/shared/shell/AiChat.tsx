import { useState, useEffect, useRef, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { defaultHeaders } from '@/lib/common';
import type {
  ApiResponse,
  ChatbotResponse,
  ChatbotResponseReturned,
} from 'types';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/shadcn/ui/card';
import { Input } from '@/components/shadcn/ui/input';
import useTeam from 'hooks/useTeam';

const AiChat: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatbotResponse[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useTranslation('common');
  const { isLoading: isTeamLoading, team } = useTeam();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const plan =
    team?.subscription?.status === 'ACTIVE'
      ? team.subscription.plan
      : 'COMMUNITY';
  const isAiChatEnabled = !!team && plan !== 'COMMUNITY';

  const togglePopup = () => {
    setVisible((v) => !v);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!team) {
      return
    }
    const form = e.currentTarget;
    const input = form.elements.namedItem('prompt') as HTMLInputElement;
    const userText = input.value.trim();
    if (!userText) return;

    const newMessages: ChatbotResponse[] = [
      ...messages,
      { content: userText, role: 'user' },
    ];
    form.reset();
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const params = new URLSearchParams({ slug: team.slug });
      const res = await fetch(`/api/chatbot?${params.toString()}`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(newMessages),
      });
      const json = (await res.json()) as ApiResponse<ChatbotResponseReturned>;
      if (!res.ok) {
        toast.error(json.error.message);
      } else {
        setMessages((prev) => [...prev, json.data.response]);
      }
    } catch {
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isTeamLoading || !isAiChatEnabled) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <div
        className={`fixed right-4 bottom-4 z-50 transition-all duration-300 transform ${
          visible
            ? 'opacity-0 translate-y-4 pointer-events-none'
            : 'opacity-100 translate-y-0'
        }`}
      >
        <Button
          onClick={togglePopup}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <ChatBubbleBottomCenterTextIcon className="w-5 h-5" />
          {t('ai-chatbot')}
        </Button>
      </div>

      {/* Chat Popup */}
      <div
        className={`fixed right-4 bottom-16 z-50 h-[80vh] transition-all duration-300 transform ${
          visible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <Card className="relative w-[20rem] md:w-[32rem] h-full flex flex-col shadow-lg border">
          <button
            onClick={togglePopup}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <CardHeader className="p-4">
            <CardTitle>{t('ai-chatbot')}</CardTitle>
          </CardHeader>

          <CardContent className="grow overflow-auto px-4 pb-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chat ${msg.role === 'assistant' ? 'chat-start' : 'chat-end'}`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img
                      src={
                        msg.role === 'assistant'
                          ? '/chatbot_assistant.png'
                          : '/chatbot_user.png'
                      }
                      alt={msg.role}
                    />
                  </div>
                </div>
                <div className="chat-bubble bg-muted text-muted-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      ol: ({ children }) => (
                        <ol className="list-decimal py-2 pl-6">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-2">{children}</li>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {isTyping && (
              <p className="mt-2 text-sm italic text-gray-500 animate-pulse">
                {t('ai-is-typing')}
              </p>
            )}
          </CardContent>

          <CardFooter className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex w-full gap-2">
              <Input
                name="prompt"
                placeholder={t('ai-type-a-question')}
                className="flex-1"
              />
              <Button type="submit" variant="ghost" className="p-2">
                <PaperAirplaneIcon className="w-5 h-5" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default AiChat;
