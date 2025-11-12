"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = "Imagen del Producto" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de archivo no válido. Use JPG, PNG, WEBP o GIF")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo es demasiado grande. Máximo 5MB")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        setPreview(data.url)
        onChange(data.url)
        toast.success("Imagen subida exitosamente")
      } else {
        toast.error(data.error || "Error al subir la imagen")
      }
    } catch (error) {
      console.error("[v0] Error uploading image:", error)
      toast.error("Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {preview ? (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
          <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="object-contain" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 bg-muted/50">
          <ImageIcon className="w-12 h-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay imagen seleccionada</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Subiendo..." : "Subir Imagen"}
        </Button>
        {preview && (
          <Button type="button" variant="outline" onClick={handleRemove}>
            <X className="w-4 h-4 mr-2" />
            Quitar
          </Button>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

      <p className="text-xs text-muted-foreground">Formatos aceptados: JPG, PNG, WEBP, GIF. Tamaño máximo: 5MB</p>
    </div>
  )
}
