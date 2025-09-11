import { NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/adminAuth'
import { deleteFile } from '@/lib/supabase' // Your existing Supabase utility

export async function DELETE(request) {
  try {
    await requireSuperAdmin(request)

    const { filePath } = await request.json()

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Delete from Supabase using your existing utility
    const deleteResult = await deleteFile(filePath)

    if (!deleteResult.success) {
      console.error('Supabase delete error:', deleteResult.error)
      return NextResponse.json({ 
        error: deleteResult.error || 'Failed to delete image' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    })

  } catch (error) {
    console.error('Location image delete error:', error)
    
    if (error.message === 'Super Admin access required') {
      return NextResponse.json({ error: 'Only super admin can delete images' }, { status: 403 })
    }
    
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })
  }
}