'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Users, MessageCircle, CheckCircle, Star, ArrowRight, Phone, MapPin, Shield, Zap, Clock } from 'lucide-react'
import { SKILLS, TRANSLATIONS } from '@/lib/constants'
import { useAuthStore } from '@/lib/store'

export default function HomePage() {
  const [searchSkill, setSearchSkill] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const { language } = useAuthStore()
  const t = TRANSLATIONS[language]

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchSkill) params.set('skill', searchSkill)
    if (searchLocation) params.set('location', searchLocation)
    
    window.location.href = `/workers?${params.toString()}`
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Digital Labour Chowk
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-Powered Safety First Platform. Connect with verified skilled workers through 
              our innovative sobriety verification system powered by Gemini AI.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">What service do you need?</label>
                  <Select value={searchSkill} onValueChange={setSearchSkill}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILLS.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <Input
                    placeholder="Enter pincode or city"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-end">
                  <Button onClick={handleSearch} className="w-full bg-orange-600 hover:bg-orange-700 h-10">
                    <Search className="w-4 h-4 mr-2" />
                    {t.search}
                  </Button>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup?type=buyer">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-8">
                  <Users className="w-5 h-5 mr-2" />
                  Post a Job
                </Button>
              </Link>
              <Link href="/auth/signup?type=worker">
                <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-8">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Find Work
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Digital Labour Chowk Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered safety verification ensures reliable and secure work connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle>1. Post or Find Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Buyers post job requirements with auto-assignment or manual worker selection. 
                  Workers browse available opportunities in their area.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle>2. AI Safety Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Workers complete a 15-second video sobriety check analyzed by Gemini AI 
                  before starting work. Ensures safety and professionalism.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center border-none shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>3. Smart Work Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Real-time job tracking, progress updates, and secure payments. 
                  AI-powered matching ensures optimal worker-job pairing.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Services
            </h2>
            <p className="text-xl text-gray-600">
              Find skilled professionals for all your needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SKILLS.slice(0, 8).map((skill) => (
              <Link key={skill} href={`/workers?skill=${skill}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
                      <span className="text-2xl">🔧</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {skill}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/workers">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Digital Labour Chowk?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Safety First</h3>
              <p className="text-gray-600">
                Gemini AI-powered sobriety verification ensures worker safety and reliability
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                AI algorithm matches workers to jobs based on skills, location, and ratings
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600">
                Live job status updates, progress tracking, and instant notifications
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Professionals</h3>
              <p className="text-gray-600">
                All workers verified with government ID and background checks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Experience the Future of Labour Services
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join the AI-powered platform that prioritizes safety, efficiency, and reliability
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup?type=buyer">
              <Button size="lg" variant="secondary" className="px-8">
                Post Your First Job
              </Button>
            </Link>
            <Link href="/auth/signup?type=worker">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8">
                Join as Verified Worker
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}