'use client'

import React from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import NLPTextProcessor from './NLPTextProcessor'

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-6">
          <h1 className="text-3xl font-bold mb-6">Healthcare Dashboard</h1>
          <NLPTextProcessor />
        </main>
      </div>
    </div>
  )
}

export default Dashboard

