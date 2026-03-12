'use client'

import { memo } from 'react'
import Image from 'next/image'
import { Camera, Mail, Calendar, BookOpen, Award, CheckCircle } from 'lucide-react'

const stats = [
  { icon: BookOpen, label: 'Enrolled', value: 5 },
  { icon: CheckCircle, label: 'Completed', value: 3 },
  { icon: Award, label: 'Certificates', value: 2 },
]

function ProfileCard({ user }) {
  return (
    <div className="bg-[#111111] rounded-xl border border-[#2A2A2A] p-6 text-center">
      {/* Avatar */}
      <div className="relative w-28 h-28 mx-auto mb-4">
        <div className="relative w-full h-full rounded-full overflow-hidden">
          <Image
            src={user.avatar}
            alt={user.name}
            fill
            className="object-cover"
          />
        </div>
        <button className="absolute bottom-0 right-0 w-9 h-9 bg-purple-800 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors border-4 border-[#111111]">
          <Camera className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Info */}
      <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
      <span className="inline-block px-3 py-1 bg-purple-800/20 text-purple-400 text-sm rounded-full mb-4">
        {user.role}
      </span>

      <div className="space-y-2 text-sm text-gray-400 mb-6">
        <div className="flex items-center justify-center gap-2">
          <Mail className="w-4 h-4" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Joined {user.joinedDate}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#2A2A2A]">
        {stats.map((stat) => (
          <div key={stat.label}>
            <stat.icon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(ProfileCard)
