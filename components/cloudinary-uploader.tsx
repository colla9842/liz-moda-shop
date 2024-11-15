'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react'

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/du3ycwhmx/image/upload'
const UPLOAD_PRESET = 'uploads'

export function CloudinaryUploaderComponent() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      console.log('Selected file:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      })
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      console.log('No file selected')
      setUploadStatus({ type: 'error', message: 'Please select a file to upload.' })
      return
    }

    setUploading(true)
    setUploadStatus(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('api_key', '652461147199923')

    console.log('Starting upload for file:', file.name)
    console.log('FormData contents:', {
      file: file.name,
      upload_preset: UPLOAD_PRESET,
      api_key: '652461147199923'
    })

    try {
      console.log('Sending request to:', CLOUDINARY_URL)
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Upload failed. Response:', errorData)
        throw new Error(`Upload failed: ${errorData}`)
      }

      const data = await response.json()
      console.log('Upload successful. Response data:', data)
      setUploadStatus({ 
        type: 'success', 
        message: `Image uploaded successfully! URL: ${data.secure_url}` 
      })
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        stack: error.stack
      })
      setUploadStatus({ 
        type: 'error', 
        message: `Upload failed: ${error.message}. Please check console for details.` 
      })
    } finally {
      setUploading(false)
      console.log('Upload process completed')
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Image to Cloudinary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <div className="text-sm text-gray-500">
                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
          {uploadStatus && (
            <Alert variant={uploadStatus.type === 'success' ? 'default' : 'destructive'}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{uploadStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}