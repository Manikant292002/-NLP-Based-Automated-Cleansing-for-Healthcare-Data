import React from 'react'
import { Bell, Search, User } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md py-4 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <Search className="ml-2 text-gray-500" size={20} />
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-indigo-600">
            <Bell size={20} />
          </button>
          <button className="flex items-center text-gray-700 hover:text-indigo-600">
            <User size={20} className="mr-1" />
            <span>John Doe</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

