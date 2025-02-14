import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

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

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid input text' }, { status: 400 })
    }

    // Process the input text
    const processedData: CleanedData = processText(text)

    // Try to load the healthcare dataset, but don't fail if it's not found
    let datasetSample = []
    try {
      const datasetPath = path.join(process.cwd(), 'data', 'healthcare_dataset.json')
      const rawData = await fs.readFile(datasetPath, 'utf8')
      const healthcareDataset = JSON.parse(rawData)
      datasetSample = healthcareDataset.slice(0, 5) // Return a sample of the dataset
    } catch (error) {
      console.warn('Healthcare dataset not found. Continuing without it.')
    }

    return NextResponse.json({
      processedData,
      datasetSample
    })
  } catch (error) {
    console.error('Error processing healthcare data:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 })
  }
}

function processText(text: string): CleanedData {
  try {
    // Clean and correct the text
    const { cleanedText, corrections } = cleanText(text)

    // Extract structured data
    const structuredData = extractStructuredData(cleanedText)

    // Perform sentiment analysis
    const sentimentAnalysis = analyzeSentiment(cleanedText)

    // Extract named entities
    const namedEntities = extractNamedEntities(cleanedText)

    // Generate summary
    const summarization = generateSummary(cleanedText)

    return {
      originalText: text,
      cleanedText,
      corrections,
      structuredData,
      sentimentAnalysis,
      namedEntities,
      summarization,
    }
  } catch (error) {
    console.error('Error in processText:', error)
    throw new Error('Failed to process text')
  }
}

function cleanText(text: string): { cleanedText: string; corrections: CleanedData['corrections'] } {
  const corrections: CleanedData['corrections'] = []
  let cleanedText = text

  const commonErrors = [
    { original: 'paitent', corrected: 'patient', type: 'spelling' as const },
    { original: 'feaver', corrected: 'fever', type: 'spelling' as const },
    { original: 'caugh', corrected: 'cough', type: 'spelling' as const },
    { original: 'hi blood presure', corrected: 'high blood pressure', type: 'terminology' as const },
    { original: 'diabetis', corrected: 'diabetes', type: 'spelling' as const },
    { original: 'hart attack', corrected: 'heart attack', type: 'spelling' as const },
  ]

  commonErrors.forEach(({ original, corrected, type }) => {
    const regex = new RegExp(`\\b${original}\\b`, 'gi')
    if (regex.test(cleanedText)) {
      cleanedText = cleanedText.replace(regex, corrected)
      corrections.push({ original, corrected, type })
    }
  })

  return { cleanedText, corrections }
}

function extractStructuredData(text: string): CleanedData['structuredData'] {
  // This is a simplified extraction. In a real-world scenario, you'd use more sophisticated NLP techniques.
  const ageMatch = text.match(/\b(\d+)[\s-]*(year|yr)s?[\s-]*old\b/i)
  const genderMatch = text.match(/\b(male|female)\b/i)
  const nameMatch = text.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/)
  const diagnosisMatch = text.match(/\bdiagnos(is|ed with)\s+(\w+(\s+\w+)*)/i)
  const medicationsMatch = text.match(/\bmedication[s]?:?\s+([\w\s,]+)/i)
  const symptomsMatch = text.match(/\bsymptoms?:?\s+([\w\s,]+)/i)
  const bpMatch = text.match(/\bBP:?\s+(\d+\/\d+)\s*mmHg\b/i)
  const hrMatch = text.match(/\bheart\s+rate:?\s+(\d+)\s*bpm\b/i)
  const tempMatch = text.match(/\btemp(erature)?:?\s+(\d+\.?\d*)\s*[°]?[CF]\b/i)

  return {
    patientId: `P${Math.floor(Math.random() * 100000)}`,
    patientName: nameMatch ? nameMatch[1] : 'Unknown',
    age: ageMatch ? parseInt(ageMatch[1]) : 0,
    gender: genderMatch ? genderMatch[1].charAt(0).toUpperCase() + genderMatch[1].slice(1) : 'Unknown',
    diagnosis: diagnosisMatch ? diagnosisMatch[2] : 'Unknown',
    medications: medicationsMatch ? medicationsMatch[1].split(/,\s*/) : [],
    symptoms: symptomsMatch ? symptomsMatch[1].split(/,\s*/) : [],
    vitalSigns: {
      bloodPressure: bpMatch ? bpMatch[1] : 'Unknown',
      heartRate: hrMatch ? parseInt(hrMatch[1]) : 0,
      temperature: tempMatch ? parseFloat(tempMatch[2]) : 0,
    },
  }
}

function analyzeSentiment(text: string): CleanedData['sentimentAnalysis'] {
  // This is a very basic sentiment analysis. In a real-world scenario, you'd use a more sophisticated NLP model.
  const positiveWords = ['good', 'great', 'excellent', 'improving', 'better', 'stable']
  const negativeWords = ['bad', 'poor', 'worse', 'critical', 'unstable', 'severe']

  const words = text.toLowerCase().split(/\W+/)
  let score = 0

  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1
    if (negativeWords.includes(word)) score -= 1
  })

  const normalizedScore = Math.tanh(score / 5) // Normalize to [-1, 1]

  return {
    score: normalizedScore,
    label: normalizedScore > 0.3 ? 'positive' : normalizedScore < -0.3 ? 'negative' : 'neutral',
  }
}

function extractNamedEntities(text: string): CleanedData['namedEntities'] {
  const entities: CleanedData['namedEntities'] = []

  // Extract potential person names (simplified)
  const nameMatches = text.match(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g)
  if (nameMatches) {
    nameMatches.forEach(name => entities.push({ entity: name, type: 'PERSON' }))
  }

  // Extract potential conditions (simplified)
  const conditionKeywords = ['diagnosed with', 'suffers from', 'condition:']
  conditionKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}\\s+(\\w+(\\s+\\w+)*)`, 'gi')
    const matches = text.match(regex)
    if (matches) {
      matches.forEach(match => {
        const condition = match.split(/\s+/).slice(2).join(' ')
        entities.push({ entity: condition, type: 'CONDITION' })
      })
    }
  })

  // Extract potential medications (simplified)
  const medicationKeywords = ['prescribed', 'taking', 'medication:']
  medicationKeywords.forEach(keyword => {
    const regex = new RegExp(`${keyword}\\s+(\\w+(\\s+\\w+)*)`, 'gi')
    const matches = text.match(regex)
    if (matches) {
      matches.forEach(match => {
        const medication = match.split(/\s+/).slice(1).join(' ')
        entities.push({ entity: medication, type: 'MEDICATION' })
      })
    }
  })

  return entities
}

function generateSummary(text: string): string {
  // This is a very basic summarization. In a real-world scenario, you'd use more advanced NLP techniques.
  const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
  const importantSentences = sentences.filter(sentence => 
    sentence.toLowerCase().includes('diagnosed') ||
    sentence.toLowerCase().includes('symptoms') ||
    sentence.toLowerCase().includes('medication') ||
    sentence.toLowerCase().includes('treatment')
  )

  return importantSentences.join('. ') + '.'
}

