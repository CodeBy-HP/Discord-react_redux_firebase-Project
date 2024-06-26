import {
  BellIcon,
  ChatBubbleLeftIcon,
  FaceSmileIcon,
  HashtagIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  GiftIcon,
} from '@heroicons/react/24/solid';
import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAuthState } from 'react-firebase-hooks/auth';
import { selectChannelId, selectChannelName } from '../features/channelSlice';
import { auth, db } from '../firebase';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, addDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import Message from './Message';

function Chat() {
  const channelId = useSelector(selectChannelId);
  const channelName = useSelector(selectChannelName);
  const [user] = useAuthState(auth);
  const inputRef = useRef('');
  const chatRef = useRef(null);

  const messagesQuery = channelId && query(
    collection(db, 'channels', channelId, 'messages'),
    orderBy('timestamp', 'asc')
  );

  const [messages] = useCollection(messagesQuery);

  const scrollToBottom = () => {
    chatRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (inputRef.current.value !== '') {
      await addDoc(collection(db, 'channels', channelId, 'messages'), {
        timestamp: serverTimestamp(),
        message: inputRef.current.value,
        name: user?.displayName,
        photoURL: user?.photoURL,
        email: user?.email,
      });
      inputRef.current.value = '';
      scrollToBottom();
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between 
      space-x-5 border-b border-gray-800 p-4 -mt-1">
        <div className="flex items-center space-x-1">
          <HashtagIcon className="h-6 text-discord_chatHeader" />
          <h4 className="text-white font-semibold">{channelName}</h4>
        </div>
        <div className="flex space-x-3">
          <BellIcon className="icon" />
          <ChatBubbleLeftIcon className="icon" />
          <UsersIcon className="icon" />
          <div className="flex bg-discord_chatHeaderInputBg 
          text-xs p-1 rounded-md">
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent focus:outline-none text-white
               pl-1 placeholder-discord_chatHeader"
            />
            <MagnifyingGlassIcon className="h-4 text-discord_chatHeader mr-1" />
          </div>
          <InboxIcon className="icon" />
          <QuestionMarkCircleIcon className="icon" />
        </div>
      </header>
      <main className="flex-grow overflow-y-scroll scrollbar-hide">
        {messages?.docs.map((doc) => {
          const { message, timestamp, name, photoURL, email } = doc.data();
          return (
            <Message
              key={doc.id}
              id={doc.id}
              message={message}
              timestamp={timestamp}
              name={name}
              email={email}
              photoURL={photoURL}
            />
          );
        })}
        <div ref={chatRef} className="pb-16" />
      </main>
      <div className="flex items-center p-2.5 bg-discord_chatInputBg mx-5 mb-7 rounded-lg">
        <PlusCircleIcon className="icon mr-4" />
        <form className="flex-grow" onSubmit={sendMessage}>
          <input
            type="text"
            disabled={!channelId}
            placeholder={channelId ? `Message #${channelName}` : 'Select a channel'}
            className="bg-transparent focus:outline-none text-discord_chatInputText
             w-full placeholder-discord_chatInput text-sm"
            ref={inputRef}
          />
          <button hidden type="submit">
            Send
          </button>
        </form>
        <GiftIcon className="icon mr-2" />
        <FaceSmileIcon className="icon" />
      </div>
    </div>
  );
}

export default Chat;
