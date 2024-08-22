"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/SurfSense.png";
import { Brain, FileCheck } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import MarkDownTest from "../markdown";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast";

type Document = {
  BrowsingSessionId: string;
  VisitedWebPageURL: string;
  VisitedWebPageTitle: string;
  VisitedWebPageDateWithTimeInISOString: string;
  VisitedWebPageReffererURL: string;
  VisitedWebPageVisitDurationInMilliseconds: number;
  VisitedWebPageContent: string;
};

// type Description = {
//   response: string;
// };

// type NormalResponse = {
//   response: string;
//   relateddocs: Document[];
// };

// type ChatMessage = {
//   type: string;
//   userquery: string;
//   message: NormalResponse | string;
// };

function ProtectedPage() {
  //   const navigate = useNavigate();
  const router = useRouter();
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false);

  const [currentChat, setCurrentChat] = useState<any[]>([]);

  const [chattitle, setChattitle] = useState<string>("");

  useEffect(() => {
    const verifyToken = async () => {
      const token = window.localStorage.getItem('token');
      // console.log(token)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL!}/verify-token/${token}`);

        if (!response.ok) {
          throw new Error('Token verification failed');
        } else {
          const NEO4JURL = localStorage.getItem('neourl');
          const NEO4JUSERNAME = localStorage.getItem('neouser');
          const NEO4JPASSWORD = localStorage.getItem('neopass');
          const OPENAIKEY = localStorage.getItem('openaikey');

          const check = (NEO4JURL && NEO4JUSERNAME && NEO4JPASSWORD && OPENAIKEY)
          if (!check) {
            router.push('/settings');
          }
        }
      } catch (error) {
        window.localStorage.removeItem('token');
        router.push('/login');
      }
    };

    verifyToken();
  }, [router]);

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    const query = formData.get("query");

    if (!query) {
      console.log("Query cant be empty!!");
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
        neourl: localStorage.getItem('neourl'),
        neouser: localStorage.getItem('neouser'),
        neopass: localStorage.getItem('neopass'),
        openaikey: localStorage.getItem('openaikey'),
        apisecretkey: process.env.NEXT_PUBLIC_API_SECRET_KEY
      }),
    };

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL!}/`, requestOptions)
      .then(res => res.json())
      .then(data => {
        let cur = currentChat;
        if(currentChat.length === 0){
          setChattitle(query)
        }
        cur.push({
          type: "normal",
          userquery: query,
          message: data,
        });


        setCurrentChat([...cur]);
        setLoading(false);
      });
  };

  const getDocDescription = async (document: Document) => {
    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: JSON.stringify(document),
        neourl: localStorage.getItem('neourl'),
        neouser: localStorage.getItem('neouser'),
        neopass: localStorage.getItem('neopass'),
        openaikey: localStorage.getItem('openaikey'),
        apisecretkey: process.env.NEXT_PUBLIC_API_SECRET_KEY
      }),
    };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL!}/kb/doc`,
      requestOptions
    );
    const res = await response.json();

    let cur = currentChat;
    cur.push({
      type: "description",
      doctitle: document.VisitedWebPageTitle,
      message: res.response,
    });

    setLoading(false);
    setCurrentChat([...cur]);
    // console.log(document);
  };

  const saveChat = async () => {
    const token = window.localStorage.getItem('token');
      // console.log(token)
      try {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: token,
            type: "general",
            title: chattitle,
            chats_list: JSON.stringify(currentChat)
          }),
        };
    
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL!}/user/chat/save`,
          requestOptions
        );
        if (!response.ok) {
          throw new Error('Token verification failed');
        } else {
          const res = await response.json();
          toast({
            title: res.message,
          })
          router.push('/chat/manage');
        }
        
      } catch (error) {
        window.localStorage.removeItem('token');
        router.push('/login');
      }
  }

  if (currentChat) {
    return (
      <>
        <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden mt-16">
          <div className="group w-full overflow-auto pl-0 peer-[[data-state=open]]:lg:pl-[250px] peer-[[data-state=open]]:xl:pl-[300px]">
            <div className="pb-[200px] pt-4 md:pt-10">
              <div className="mx-auto max-w-4xl px-4 flex flex-col gap-3">
                <div className="bg-background flex flex-col gap-2 rounded-lg border p-8">
                  <h1 className="text-sm font-semibold">
                    Welcome to SurfSense General Chat
                  </h1>
                  <p className="text-muted-foreground leading-normal">
                    🧠 Ask Your Knowledge Graph Brain About Your Saved Content 🧠
                  </p>
                </div>

                {currentChat.map((chat, index) => {
                  // console.log("chat", chat);
                  if (chat.type === "normal") {
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          ease: [0, 0.71, 0.2, 1.01],
                          scale: {
                            type: "spring",
                            damping: 5,
                            stiffness: 100,
                            restDelta: 0.001
                          }
                        }}
                        className="bg-background flex flex-col gap-2 rounded-lg border p-8"
                        key={index}
                      >
                        <Brain />
                        <p className="text-3xl font-semibold">
                          {chat.userquery}
                        </p>
                        <MarkDownTest source={chat.message.response} />
                        <p className="font-sm font-semibold">
                          Related Browsing Sessions
                        </p>

                        {
                          //@ts-ignore
                          chat.message.relateddocs.map((doc) => {
                            return (
                              <Collapsible className="border rounded-lg p-3">
                                <CollapsibleTrigger className="flex justify-between gap-2 mb-2">
                                  <FileCheck />
                                  {doc.VisitedWebPageTitle}
                                </CollapsibleTrigger>
                                <CollapsibleContent className="flex flex-col gap-4">
                                  <Table>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell className="font-medium">
                                          Browsing Session Id
                                        </TableCell>
                                        <TableCell>
                                          {doc.BrowsingSessionId}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">
                                          URL
                                        </TableCell>
                                        <TableCell>
                                          {doc.VisitedWebPageURL}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">
                                          Reffering URL
                                        </TableCell>
                                        <TableCell>
                                          {doc.VisitedWebPageReffererURL}
                                        </TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell className="font-medium">
                                          Date & Time Visited
                                        </TableCell>
                                        <TableCell>
                                          {
                                            doc.VisitedWebPageDateWithTimeInISOString
                                          }
                                        </TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell className="font-medium">
                                          Visit Duration (In Milliseconds)
                                        </TableCell>
                                        <TableCell>
                                          {
                                            doc.VisitedWebPageVisitDurationInMilliseconds
                                          }
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                  <button
                                    type="button"
                                    onClick={() => getDocDescription(doc)}
                                    className="text-gray-900 w-full hover:text-white border border-gray-800 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
                                  >
                                    Get More Information
                                  </button>
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })
                        }
                      </motion.div>
                    );
                  }

                  if (chat.type === "description") {
                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.3,
                          ease: [0, 0.71, 0.2, 1.01],
                          scale: {
                            type: "spring",
                            damping: 5,
                            stiffness: 100,
                            restDelta: 0.001
                          }
                        }}
                        className="bg-background flex flex-col gap-2 rounded-lg border p-8"
                        key={index}
                      >
                        <Brain />
                        <p className="text-3xl font-semibold">
                          {chat.doctitle}
                        </p>
                        <MarkDownTest source={chat.message} />
                      </motion.div>
                    );
                  }
                })}


              </div>
              <div className="h-px w-full"></div>
            </div>
            <div className="from-muted/30 to-muted/30 animate-in dark:from-background/10 dark:to-background/80 inset-x-0 bottom-0 w-full duration-300 ease-in-out peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px] dark:from-10%">
              <div className="mx-auto sm:max-w-4xl sm:px-4">

                <div className={loading ? "rounded-md p-4 w-full my-4" : "hidden"}>
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-slate-700 h-10 w-10">
                    </div>
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-2 bg-slate-700 rounded"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="h-2 bg-slate-700 rounded col-span-2"></div>
                          <div className="h-2 bg-slate-700 rounded col-span-1"></div>
                        </div>
                        <div className="h-2 bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-background space-y-4 border-t px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
                  <form action={handleSubmit}>
                    <div className="bg-background relative flex max-h-60 w-full grow flex-col overflow-hidden px-8 sm:rounded-md sm:border sm:px-12">
                      <Image
                        className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 w-9 bg-background absolute left-0 top-[13px] size-8 rounded-full p-0 sm:left-4"
                        src={logo}
                        alt="aiicon"
                      />
                      <span className="sr-only">New Chat</span>
                      <textarea
                        placeholder="Send a message."
                        className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                        name="query"
                      ></textarea>
                      <div className="absolute right-0 top-[13px] sm:right-4">
                        <button
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 w-9"
                          type="submit"
                          data-state="closed"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 256 256"
                            fill="currentColor"
                            className="size-4"
                          >
                            <path d="M200 32v144a8 8 0 0 1-8 8H67.31l34.35 34.34a8 8 0 0 1-11.32 11.32l-48-48a8 8 0 0 1 0-11.32l48-48a8 8 0 0 1 11.32 11.32L67.31 168H184V32a8 8 0 0 1 16 0Z"></path>
                          </svg>
                          <span className="sr-only">Send message</span>
                        </button>
                      </div>
                    </div>
                  </form>
                  <div className="flex justify-center">
                    {chattitle ? (  <button 
                    onClick={() => saveChat()}
                    className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block">
                      <span className="absolute inset-0 overflow-hidden rounded-full">
                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </span>
                      <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
                        <span>
                          Save Chat
                        </span>
                        <svg
                          fill="none"
                          height="16"
                          viewBox="0 0 24 24"
                          width="16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M10.75 8.75L14.25 12L10.75 15.25"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                      <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                    </button>) : (<></>)}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default ProtectedPage;
