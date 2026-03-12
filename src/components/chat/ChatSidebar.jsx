'use client'

import { memo, useState } from 'react'
import Image from 'next/image'
import { Search } from 'lucide-react'
import Input from '../ui/Input'
import { chatContacts } from '../../constants/data'

function ChatSidebar({ selectedContact, onSelectContact, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredContacts = chatContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col bg-[#111111]">
      {/* Header */}
      <div className="p-4 border-b border-[#2A2A2A]">
        <h2 className="text-xl font-semibold text-white mb-4">Messages</h2>
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Contacts List */}
      <div className="flex-grow overflow-y-auto">
        {filteredContacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => {
              onSelectContact(contact)
              if (onClose) onClose()
            }}
            className={`
              w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors text-left
              ${selectedContact?.id === contact.id ? 'bg-purple-800/20 border-l-2 border-purple-500' : ''}
            `}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image
                  src={contact.avatar}
                  alt={contact.name}
                  fill
                  className="object-cover"
                />
              </div>
              {contact.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111111]" />
              )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-white truncate">{contact.name}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">{contact.time}</span>
              </div>
              <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
            </div>

            {/* Unread Badge */}
            {contact.unread > 0 && (
              <span className="flex-shrink-0 w-5 h-5 bg-purple-800 rounded-full text-xs flex items-center justify-center text-white font-medium">
                {contact.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(ChatSidebar)
