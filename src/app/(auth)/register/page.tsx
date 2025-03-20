'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [secretKey, setSecretKey] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true)
      setError(null)

      console.log('Starting registration process')
      console.log('Registration data:', {
        name: data.name,
        email: data.email,
        password: '***' // Don't log actual password
      })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      
      // Log the raw response text first
      const responseText = await response.text()
      console.log('Raw response:', responseText)
      
      // Try to parse the response as JSON
      let result
      try {
        result = JSON.parse(responseText)
        console.log('Parsed response:', result)
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        throw new Error('Invalid response format from server')
      }

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      // If 2FA setup is required
      if (result.qrCode && result.secret) {
        console.log('2FA setup required')
        setQrCodeUrl(result.qrCode)
        setSecretKey(result.secret)
        setShowQRCode(true)
        return
      }

      // Registration successful
      console.log('Registration successful, redirecting to login')
      router.push('/login?message=Registration successful! Please log in.')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your details to create your account
          </p>
        </div>

        <div className="grid gap-6">
          {!showQRCode ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Input
                  {...register('name')}
                  placeholder="Full Name"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  error={errors.name?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Input
                  {...register('email')}
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Input
                  {...register('password')}
                  placeholder="Password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Input
                  {...register('confirmPassword')}
                  placeholder="Confirm Password"
                  type="password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h2 className="mb-2 text-lg font-semibold">Set up Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code with your authenticator app to enable 2FA
                </p>
                {qrCodeUrl && (
                  <div className="flex justify-center mb-4">
                    <Image
                      src={qrCodeUrl}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                )}
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  Secret key: {secretKey}
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Continue to Login
              </Button>
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 