import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Send,
  MoreVertical,
  Users,
  MessageSquare,
  PanelLeft,
  X,
} from "lucide-react";
import { io } from "socket.io-client";

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
});

const getToken = () => localStorage.getItem("token");

const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateDivider = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";

  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
};

const getOtherParticipant = (conversation, currentUserId) => {
  if (!conversation?.participants) return null;
  return conversation.participants.find(
    (item) => String(item._id) !== String(currentUserId)
  );
};

const Avatar = ({ name = "User", large = false }) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`${
        large ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"
      } flex shrink-0 items-center justify-center rounded-2xl bg-slate-900 font-semibold text-white shadow-sm ring-1 ring-slate-200`}
    >
      {initials}
    </div>
  );
};

export default function EmployeeInbox() {
  const currentUser = useMemo(() => getUser(), []);
  const currentUserId = currentUser?._id || currentUser?.id;

  const [people, setPeople] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const q = search.toLowerCase();
      return (
        person.name?.toLowerCase().includes(q) ||
        person.email?.toLowerCase().includes(q) ||
        person.department?.toLowerCase().includes(q)
      );
    });
  }, [people, search]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.connect();
    socket.emit("join", currentUserId);

    const receiveHandler = (incomingMessage) => {
      const activeConversationId =
        selectedConversation?._id || selectedConversation?.id;

      const incomingConversationId =
        incomingMessage?.conversationId ||
        incomingMessage?.conversation ||
        incomingMessage?.message?.conversation;

      if (
        activeConversationId &&
        incomingConversationId &&
        String(activeConversationId) === String(incomingConversationId)
      ) {
        const finalMessage =
          incomingMessage?.message && incomingMessage.message.text
            ? incomingMessage.message
            : incomingMessage;

        setMessages((prev) => {
          const exists = prev.some(
            (item) => String(item._id) === String(finalMessage._id)
          );
          if (exists) return prev;
          return [...prev, finalMessage];
        });
      }

      loadConversations();
    };

    socket.on("receiveMessage", receiveHandler);

    return () => {
      socket.off("receiveMessage", receiveHandler);
      socket.disconnect();
    };
  }, [currentUserId, selectedConversation]);

  useEffect(() => {
    loadPeople();
    loadConversations();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, [messages]);

  const loadPeople = async () => {
    try {
      setLoadingPeople(true);
      const res = await fetch(`${API_BASE}/messages/employees`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();

      if (res.ok) {
        setPeople(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to load people:", error);
    } finally {
      setLoadingPeople(false);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/messages/conversation`, {
        method: "GET",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const openChat = async (person) => {
    try {
      setSelectedUser(person);
      setSidebarOpen(false);
      setLoadingMessages(true);

      const res = await fetch(`${API_BASE}/messages/conversation`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ receiverId: person._id }),
      });
      const conversation = await res.json();

      if (!res.ok) {
        setLoadingMessages(false);
        return;
      }

      setSelectedConversation(conversation);
      socket.emit("joinConversation", conversation._id);

      const msgRes = await fetch(
        `${API_BASE}/messages/conversation/${conversation._id}`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const msgData = await msgRes.json();
      if (msgRes.ok) {
        setMessages(Array.isArray(msgData) ? msgData : []);
      }

      loadConversations();
    } catch (error) {
      console.error("Failed to open chat:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedConversation || !selectedUser) return;

    const text = messageText.trim();
    setMessageText("");

    try {
      const res = await fetch(`${API_BASE}/messages/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          text,
        }),
      });

      const newMessage = await res.json();
      if (!res.ok) return;

      setMessages((prev) => [...prev, newMessage]);

      socket.emit("sendMessage", {
        conversationId: selectedConversation._id,
        senderId: currentUserId,
        receiverId: selectedUser._id,
        text,
        message: newMessage,
      });

      loadConversations();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const getConversationForPerson = (personId) => {
    return conversations.find((conversation) => {
      const other = getOtherParticipant(conversation, currentUserId);
      return String(other?._id) === String(personId);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white p-3 sm:p-4 lg:p-6">
      <div className="mx-auto flex h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur xl:h-[calc(100vh-3rem)]">
        <div
          className={`absolute inset-y-0 left-0 z-30 w-[88%] max-w-[360px] transform border-r border-slate-200 bg-white transition duration-300 md:static md:z-0 md:w-[360px] md:translate-x-0 lg:w-[390px] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.history.back()}
                    className="rounded-xl border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-100"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                      Messages
                    </h1>
                    <p className="text-sm text-slate-500">Chat with coworkers</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                    <Users size={18} />
                  </div>

                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search coworkers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingPeople ? (
                <div className="p-5 text-sm text-slate-500">Loading...</div>
              ) : filteredPeople.length === 0 ? (
                <div className="p-5 text-sm text-slate-500">No users found.</div>
              ) : (
                filteredPeople.map((person) => {
                  const conversation = getConversationForPerson(person._id);
                  const active = String(selectedUser?._id) === String(person._id);

                  return (
                    <button
                      key={person._id}
                      onClick={() => openChat(person)}
                      className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-4 text-left transition sm:px-5 ${
                        active ? "bg-slate-50" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <Avatar name={person.name} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-[15px]">
                            {person.name}
                          </h3>
                          <span className="shrink-0 text-[11px] text-slate-400">
                            {conversation?.lastMessageAt
                              ? formatTime(conversation.lastMessageAt)
                              : ""}
                          </span>
                        </div>

                        <p className="truncate text-xs text-slate-500 sm:text-sm">
                          {person.department || "Department"}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {conversation?.lastMessage || "Start conversation"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 z-20 bg-slate-900/30 md:hidden"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col bg-[radial-gradient(circle_at_top,_rgba(241,245,249,0.7),_transparent_40%)]">
          {!selectedUser ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-900 text-white shadow-lg shadow-slate-200">
                <MessageSquare size={30} />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                Choose a coworker
              </h2>
              <p className="mt-2 max-w-md text-sm text-slate-500 sm:text-base">
                Start a conversation from the left panel.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm md:hidden"
              >
                <PanelLeft size={16} /> Open chats
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
                    >
                      <PanelLeft size={18} />
                    </button>

                    <Avatar name={selectedUser.name} large />

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                        {selectedUser.name}
                      </h2>
                      <p className="truncate text-xs text-slate-500 sm:text-sm">
                        {selectedUser.role} • {selectedUser.department || "General"}
                      </p>
                    </div>
                  </div>

                  <button className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5">
                {loadingMessages ? (
                  <div className="text-sm text-slate-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                    No messages yet. Start the conversation.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg, index) => {
                      const senderId = msg?.sender?._id || msg?.sender;
                      const isMine = String(senderId) === String(currentUserId);
                      const previous = messages[index - 1];
                      const showDivider =
                        !previous || !isSameDay(previous.createdAt, msg.createdAt);

                      return (
                        <React.Fragment key={msg._id || index}>
                          {showDivider && (
                            <div className="flex justify-center py-2">
                              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                                {formatDateDivider(msg.createdAt)}
                              </span>
                            </div>
                          )}

                          <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[86%] rounded-3xl px-4 py-3 text-sm shadow-sm sm:max-w-[72%] ${
                                isMine
                                  ? "rounded-br-lg bg-slate-900 text-white"
                                  : "rounded-bl-lg border border-slate-200 bg-white text-slate-800"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words leading-relaxed">
                                {msg.text}
                              </p>
                              <p
                                className={`mt-1 text-[11px] ${
                                  isMine ? "text-slate-300" : "text-slate-400"
                                }`}
                              >
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white/85 p-3 backdrop-blur sm:p-4">
                <div className="flex items-end gap-3 rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[48px] flex-1 rounded-2xl bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  />
                  <button
                    onClick={sendMessage}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm transition hover:opacity-90"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}