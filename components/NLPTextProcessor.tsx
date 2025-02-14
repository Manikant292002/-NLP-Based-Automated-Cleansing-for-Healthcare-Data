'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download, Brain, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useToast } from "@/components/ui/use-toast"
import LoadingAnimation from './LoadingAnimation'

interface CleanedData {
  originalText: string
  cleanedText: string
  corrections: {
    original: string
    corrected: string
    type: 'spelling' | 'grammar' | 'formatting' | 'terminology'
  }[]
  structuredData: {
    patientId: string
    patientName: string
    age: number
    gender: string
    diagnosis: string
    medications: string[]
    symptoms: string[]
    vitalSigns: {
      bloodPressure: string
      heartRate: number
      temperature: number
    }
  }
  sentimentAnalysis: {
    score: number
    label: 'positive' | 'neutral' | 'negative'
  }
  namedEntities: {
    entity: string
    type: string
  }[]
  summarization: string
}

const sampleInputs = [
  "Patient John Doe, a 45-year-old male, presented with hi blood presure and complained of severe headaches. He has a history of diabetis and is currently taking metformin. The patient reported experiencing dizziness and blurred vision.",
  "Sarah Smith, female, age 32, visited the clinic with symptoms of feaver, caugh, and fatigue. She was diagnosed with a respiratory infection and prescribed antibiotics. The patient has no known allergies.",
  "Mr. Robert Johnson, 58 years old, came in for a follow-up after his recent hart attack. He's been taking aspirin and beta-blockers as prescribed. The patient reported feeling much better but still experiences some shortness of breath during physical activity."
]

const NLPTextProcessor: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [cleanedData, setCleanedData] = useState<CleanedData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleProcessData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/process-healthcare-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process data')
      }

      const result = await response.json()
      setCleanedData(result.processedData)
      toast({
        title: "Data Processed Successfully",
        description: "Your healthcare data has been analyzed using NLP techniques.",
      })
    } catch (err) {
      console.error('Error processing data:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      toast({
        title: "Error",
        description: "Failed to process the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    if (!cleanedData) return

    const report = `
NLP-Processed Healthcare Report

Patient Information:
Patient ID: ${cleanedData.structuredData.patientId}
Name: ${cleanedData.structuredData.patientName}
Age: ${cleanedData.structuredData.age}
Gender: ${cleanedData.structuredData.gender}

Diagnosis: ${cleanedData.structuredData.diagnosis}

Medications:
${cleanedData.structuredData.medications.map(med => `- ${med}`).join('\n')}

Symptoms:
${cleanedData.structuredData.symptoms.map(symptom => `- ${symptom}`).join('\n')}

Vital Signs:
- Blood Pressure: ${cleanedData.structuredData.vitalSigns.bloodPressure}
- Heart Rate: ${cleanedData.structuredData.vitalSigns.heartRate} bpm
- Temperature: ${cleanedData.structuredData.vitalSigns.temperature}°C

Cleaned Medical Notes:
${cleanedData.cleanedText}

Corrections Made:
${cleanedData.corrections.map(correction => `- ${correction.original} → ${correction.corrected} (${correction.type})`).join('\n')}

Sentiment Analysis:
Score: ${cleanedData.sentimentAnalysis.score}
Label: ${cleanedData.sentimentAnalysis.label}

Named Entities:
${cleanedData.namedEntities.map(entity => `- ${entity.entity} (${entity.type})`).join('\n')}

Summarization:
${cleanedData.summarization}
    `.trim()

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nlp_healthcare_report_${cleanedData.structuredData.patientId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast({
      title: "Report Downloaded",
      description: "Your NLP-processed healthcare report has been downloaded.",
    })
  }

  const getChartData = () => {
    if (!cleanedData) return []

    return [
      { name: 'Age', value: cleanedData.structuredData.age },
      { name: 'Heart Rate', value: cleanedData.structuredData.vitalSigns.heartRate },
      { name: 'Temperature', value: cleanedData.structuredData.vitalSigns.temperature },
      { name: 'Medications', value: cleanedData.structuredData.medications.length },
      { name: 'Symptoms', value: cleanedData.structuredData.symptoms.length },
    ]
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardTitle className="text-3xl font-bold flex items-center">
            <Brain className="mr-2" /> NLP-Powered Healthcare Data Processing
          </CardTitle>
          <CardDescription className="text-blue-100">Enter healthcare data for advanced NLP analysis</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Textarea
            placeholder="Enter healthcare data here (e.g., patient records, medical notes)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="w-full mb-4 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          />
          <div className="flex justify-between items-center">
            <Button onClick={handleProcessData} disabled={loading || inputText.trim().length === 0}
                    className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <LoadingAnimation />
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Process Data
                </>
              )}
            </Button>
            <div className="space-x-2">
              {sampleInputs.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(sample)}
                  className="text-xs"
                >
                  Sample {index + 1}
                </Button>
              ))}
            </div>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-red-500 bg-red-100 p-2 rounded-md"
            >
              Error: {error}
            </motion.p>
          )}
        </CardContent>
        <AnimatePresence>
          {cleanedData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardFooter className="flex flex-col items-start bg-white rounded-b-lg">
                <Tabs defaultValue="structured" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="structured">Structured Data</TabsTrigger>
                    <TabsTrigger value="nlp">NLP Analysis</TabsTrigger>
                    <TabsTrigger value="corrections">Corrections</TabsTrigger>
                    <TabsTrigger value="visualization">Visualization</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                  </TabsList>
                  <TabsContent value="structured">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4"
                    >
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md shadow">
                          <h4 className="font-semibold text-blue-700 mb-2">Patient Information:</h4>
                          <ul className="list-none space-y-1">
                            <li><span className="font-medium">ID:</span> {cleanedData.structuredData.patientId}</li>
                            <li><span className="font-medium">Name:</span> {cleanedData.structuredData.patientName}</li>
                            <li><span className="font-medium">Age:</span> {cleanedData.structuredData.age}</li>
                            <li><span className="font-medium">Gender:</span> {cleanedData.structuredData.gender}</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md shadow">
                          <h4 className="font-semibold text-green-700 mb-2">Diagnosis:</h4>
                          <p>{cleanedData.structuredData.diagnosis}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-md shadow">
                          <h4 className="font-semibold text-yellow-700 mb-2">Medications:</h4>
                          <ul className="list-disc list-inside">
                            {cleanedData.structuredData.medications.map((med, index) => (
                              <li key={index}>{med}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-red-50 p-4 rounded-md shadow">
                          <h4 className="font-semibold text-red-700 mb-2">Symptoms:</h4>
                          <ul className="list-disc list-inside">
                            {cleanedData.structuredData.symptoms.map((symptom, index) => (
                              <li key={index}>{symptom}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-md shadow">
                          <h4 className="font-semibold text-purple-700 mb-2">Vital Signs:</h4>
                          <ul className="list-none space-y-1">
                            <li><span className="font-medium">Blood Pressure:</span> {cleanedData.structuredData.vitalSigns.bloodPressure}</li>
                            <li><span className="font-medium">Heart Rate:</span> {cleanedData.structuredData.vitalSigns.heartRate} bpm</li>
                            <li><span className="font-medium">Temperature:</span> {cleanedData.structuredData.vitalSigns.temperature}°C</li>
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="nlp">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4"
                    >
                      <div className="bg-indigo-50 p-4 rounded-md shadow">
                        <h4 className="font-semibold text-indigo-700 mb-2">Sentiment Analysis:</h4>
                        <p>Score: {cleanedData.sentimentAnalysis.score.toFixed(2)}</p>
                        <p>Label: {cleanedData.sentimentAnalysis.label}</p>
                      </div>
                      <div className="bg-pink-50 p-4 rounded-md shadow">
                        <h4 className="font-semibold text-pink-700 mb-2">Named Entities:</h4>
                        <ul className="list-disc list-inside">
                          {cleanedData.namedEntities.map((entity, index) => (
                            <li key={index}>{entity.entity} ({entity.type})</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="corrections">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-indigo-50 p-4 rounded-md shadow mt-4"
                    >
                      <h4 className="font-semibold text-indigo-700 mb-2">Corrections:</h4>
                      <ul className="list-disc list-inside">
                        {cleanedData.corrections.map((correction, index) => (
                          <li key={index}>
                            <span className="line-through text-red-500">{correction.original}</span> →{' '}
                            <span className="text-green-500">{correction.corrected}</span> ({correction.type})
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="visualization">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-full mt-4"
                    >
                      <h4 className="font-semibold text-lg mb-2 text-gray-700">Patient Data Visualization:</h4>
                      <div className="h-64 w-full bg-white rounded-lg shadow-inner p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>
                  </TabsContent>
                  <TabsContent value="summary">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-teal-50 p-4 rounded-md shadow mt-4"
                    >
                      <h4 className="font-semibold text-teal-700 mb-2">Summarization:</h4>
                      <p>{cleanedData.summarization}</p>
                    </motion.div>
                  </TabsContent>
                </Tabs>
                <Button onClick={handleDownloadReport} className="mt-6 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105">
                  <Download className="mr-2 h-4 w-4" />
                  Download NLP Report
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default NLPTextProcessor

