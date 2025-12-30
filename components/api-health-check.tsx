"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react"
import { API_CONFIG, checkApiHealth } from "@/config/api"

interface HealthStatus {
  isHealthy: boolean
  responseTime: number
  error?: string
  timestamp: Date
}

export function ApiHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    const startTime = Date.now()
    
    try {
      const isHealthy = await checkApiHealth()
      const responseTime = Date.now() - startTime
      
      setHealthStatus({
        isHealthy,
        responseTime,
        timestamp: new Date()
      })
    } catch (error) {
      const responseTime = Date.now() - startTime
      setHealthStatus({
        isHealthy: false,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date()
      })
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusIcon = () => {
    if (!healthStatus) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return healthStatus.isHealthy 
      ? <CheckCircle className="h-5 w-5 text-green-500" />
      : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = () => {
    if (!healthStatus) return <Badge variant="secondary">Unknown</Badge>
    return healthStatus.isHealthy 
      ? <Badge variant="default" className="bg-green-500">Healthy</Badge>
      : <Badge variant="destructive">Unhealthy</Badge>
  }

  const getStatusColor = () => {
    if (!healthStatus) return "text-yellow-600"
    return healthStatus.isHealthy ? "text-green-600" : "text-red-600"
  }

  return (
    <Card className="w-full max-w-md overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-white via-gray-50 to-slate-100">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-600/5 via-slate-600/5 to-gray-600/5" />
      <CardHeader className="relative bg-gradient-to-r from-gray-700 to-slate-800 text-white pb-8">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              {getStatusIcon()}
            </div>
            API Health Status
          </CardTitle>
          <CardDescription className="text-gray-200 text-sm mt-2">
            Monitor the health of your backend API
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {healthStatus && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Response Time:</span>
              <span className="text-sm text-muted-foreground">
                {healthStatus.responseTime}ms
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Check:</span>
              <span className="text-sm text-muted-foreground">
                {healthStatus.timestamp.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API URL:</span>
              <span className="text-sm text-muted-foreground font-mono">
                {API_CONFIG.BASE_URL}
              </span>
            </div>
          </>
        )}

        {healthStatus?.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {healthStatus.error}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={checkHealth} 
          disabled={isChecking}
          className="w-full h-12 bg-gradient-to-r from-gray-700 to-slate-800 hover:from-gray-800 hover:to-slate-900 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          {isChecking ? (
            <>
              <RefreshCw className="mr-3 h-5 w-5 animate-spin" />
              Checking Health...
            </>
          ) : (
            <>
              <RefreshCw className="mr-3 h-5 w-5" />
              Check Health Status
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Click to manually check API health status
        </div>
      </CardContent>
    </Card>
  )
}
