'use client'
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import React from 'react'

type LogoutButtonProps = {
  children: React.ReactNode
}

export default function LogoutButton({ children }: LogoutButtonProps) {
   const router = useRouter()

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.refresh(); // redirect to login page
        },
      },
    });
  };
  
  return (
    <span onClick={handleLogout}>
      {children}
    </span>
  )
}
