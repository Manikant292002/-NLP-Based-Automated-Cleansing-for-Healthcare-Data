'use client'

import NLPTextProcessor from '../components/NLPTextProcessor'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-8 px-4">
      <motion.h1 
        className="text-4xl font-bold mb-6 text-center text-indigo-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        NLP-Powered Healthcare Data Processing
      </motion.h1>
      <NLPTextProcessor />
    </main>
  )
}

